//! Runs `x-philomena` mappings against the local Philomena instances.
//!
//! Usage: `cargo run -p backend --bin api-verify -- [--all | <operationId>...] [--remote]`.
//! Writes raw upstream responses to `api/fixtures/` and marks routes `verified`
//! in `api/coverage.json`.

use std::{
    collections::BTreeMap,
    fs,
    path::{Path, PathBuf},
    process::ExitCode,
};

use anyhow::{Context as _, Result};
use backend::mapping::{
    Context, Document, Operation, Responses, Session, Strategy, Throttle, extract, fetch,
    select_strategy, validate,
};
use serde::Deserialize;
use serde_json::Value;

/// hCaptcha's published test response. The local stacks run with its test
/// secret key, so it passes their sign-in captcha.
const HCAPTCHA_TEST_RESPONSE: &str = "10000000-aaaa-bbbb-cccc-000000000001";

#[derive(Debug, Deserialize)]
struct Instance {
    origin: String,
    flavor: String,
    /// A live third-party site. Only verified with `--remote`, so routine runs
    /// do not hit it (it rate limits).
    #[serde(default)]
    remote: bool,
}

#[tokio::main]
async fn main() -> ExitCode {
    match run().await {
        Ok(true) => ExitCode::SUCCESS,
        Ok(false) => ExitCode::FAILURE,
        Err(err) => {
            eprintln!("Error: {err:#}");
            ExitCode::FAILURE
        }
    }
}

/// Saves the upstream responses as fixtures: `<op>.json` (or `.html`), a join's
/// follow-up as `<op>.<join>.json` and each fan-out response as
/// `<op>.fanout<index>.json`.
fn write_fixtures(
    dir: &Path,
    op_id: &str,
    strategy: &Strategy,
    responses: Responses,
) -> Result<()> {
    let ext = if matches!(strategy, Strategy::Html(_)) {
        "html"
    } else {
        "json"
    };
    fs::create_dir_all(dir)?;
    // A JSON endpoint behind a form strategy answers the submission itself.
    let main = if matches!(strategy, Strategy::Form(_)) && responses.main.is_empty() {
        responses.submitted
    } else {
        responses.main
    };
    fs::write(dir.join(format!("{op_id}.{ext}")), main)?;
    for (join, body) in responses.joins {
        fs::write(dir.join(format!("{op_id}.{join}.json")), body)?;
    }
    for (index, body) in responses.fanout.iter().enumerate() {
        fs::write(dir.join(format!("{op_id}.fanout{index}.json")), body)?;
    }
    Ok(())
}

/// The API key to verify `op` with, if it uses one. It comes from the
/// environment, e.g. `VERIFY_KEY_PHILOMENA`, so it never lands in a file.
/// `Err` says why the operation cannot be verified.
fn key_for(op: &Operation, instance: &str) -> Result<Option<String>, String> {
    let var = format!(
        "VERIFY_KEY_{}",
        instance.to_ascii_uppercase().replace('-', "_")
    );
    match op.auth.as_str() {
        // Optional keys are verified as the public sees the page. A session is
        // made in `session_for`, from the login in the environment.
        "none" | "api-key-optional" | "session" | "session+csrf" | "session:anonymous" => Ok(None),
        "api-key" => std::env::var(&var)
            .map(Some)
            .map_err(|_| format!("needs an API key in {var}")),
        other => Err(format!(
            "auth {other:?} is not supported by the verifier yet"
        )),
    }
}

/// The example parameters of `op`; for `createSession`, the login of the instance.
fn with_login(
    op: &Operation,
    name: &str,
    examples: &BTreeMap<String, String>,
) -> BTreeMap<String, String> {
    let mut params = examples.clone();
    // `VERIFY_PARAM_<NAME>_<INSTANCE>` replaces an example, for values that
    // cannot be written down, such as the token of an email.
    for (key, value) in &mut params {
        let var = format!(
            "VERIFY_PARAM_{}_{}",
            key.to_ascii_uppercase(),
            name.to_ascii_uppercase().replace('-', "_")
        );
        if let Ok(replacement) = std::env::var(var) {
            value.clone_from(&replacement);
        }
    }
    if op.auth.starts_with("session") {
        params.insert("captchaToken".to_owned(), HCAPTCHA_TEST_RESPONSE.to_owned());
    }
    if op.id == "createSession" {
        let var = format!(
            "VERIFY_LOGIN_{}",
            name.to_ascii_uppercase().replace('-', "_")
        );
        if let Some((email, password)) = std::env::var(var)
            .ok()
            .as_deref()
            .and_then(|v| v.split_once(':'))
        {
            params.insert("email".to_owned(), email.to_owned());
            params.insert("password".to_owned(), password.to_owned());
        }
    }
    params
}

/// The session an operation runs with: none for the public ones, a fresh one for
/// `createSession` (which signs in itself) and a signed-in one for the rest.
async fn session_for(
    client: &reqwest::Client,
    document: &Document,
    op: &Operation,
    instance: &Instance,
    name: &str,
) -> Result<Option<Session>, String> {
    if !matches!(
        op.auth.as_str(),
        "session" | "session+csrf" | "session:anonymous"
    ) {
        return Ok(None);
    }
    if op.id == "createSession" || op.auth == "session:anonymous" {
        let fresh = Session::from_cookie_header("");
        fresh.ensure_fingerprint();
        return Ok(Some(fresh));
    }
    sign_in(
        client,
        document,
        instance,
        name,
        op.id == "createSessionTotp",
    )
    .await
    .map(Some)
}

/// A signed-in session on `instance`, from `VERIFY_LOGIN_<INSTANCE>` (`email:password`),
/// made by running the `createSession` operation like a browser would.
/// `Err` says why the operation cannot be verified.
async fn sign_in(
    client: &reqwest::Client,
    document: &Document,
    instance: &Instance,
    name: &str,
    half: bool,
) -> Result<Session, String> {
    let var = format!(
        "VERIFY_LOGIN_{}",
        name.to_ascii_uppercase().replace('-', "_")
    );
    let login =
        std::env::var(&var).map_err(|_| format!("needs a login in {var} (email:password)"))?;
    let (email, password) = login
        .split_once(':')
        .ok_or_else(|| format!("{var} must be email:password"))?;
    let op = document
        .operation("createSession")
        .ok_or("no createSession operation to sign in with")?;
    let strategy = select_strategy(op, &instance.flavor)
        .ok_or_else(|| format!("no sign-in for flavor {}", instance.flavor))?;
    let session = Session::from_cookie_header("");
    session.ensure_fingerprint();
    let ctx = Context {
        origin: &instance.origin,
        flavor: &instance.flavor,
        api_key: None,
        session: Some(&session),
    };
    let params: BTreeMap<String, String> = [
        ("email".to_owned(), email.to_owned()),
        ("password".to_owned(), password.to_owned()),
        ("captchaToken".to_owned(), HCAPTCHA_TEST_RESPONSE.to_owned()),
    ]
    .into();
    let responses = fetch(client, &Throttle::default(), ctx, strategy, &params)
        .await
        .map_err(|err| format!("signing in failed: {err:#}"))?;
    let answer = extract(strategy, &responses, ctx, &params)
        .map_err(|err| format!("signing in failed: {err:#}"))?;
    // `half`: stop where the site asks for the 2FA code, for the operation that gives it.
    let wanted = if half {
        "secondFactorRequired"
    } else {
        "signedIn"
    };
    if answer.get(wanted) != Some(&Value::Bool(true)) {
        return Err(format!("signing in did not reach {wanted}"));
    }
    Ok(session)
}

/// Marks the routes of `op` verified when every instance they live on passed.
fn mark_verified(coverage: &mut Value, op: &Operation, passed: &[&str]) {
    for route in &op.routes {
        let Some(entry) = coverage.get_mut(route) else {
            continue;
        };
        let wanted: Vec<&str> = entry["instances"]
            .as_array()
            .map_or_else(Vec::new, |a| a.iter().filter_map(Value::as_str).collect());
        if !wanted.is_empty() && wanted.iter().all(|w| passed.contains(w)) {
            entry["status"] = Value::from("verified");
        }
    }
}

async fn run() -> Result<bool> {
    let api_dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../api");
    let document = Document::parse(&fs::read_to_string(api_dir.join("openapi.json"))?)?;
    let instances: BTreeMap<String, Instance> =
        serde_json::from_str(&fs::read_to_string(api_dir.join("instances.json"))?)?;
    let coverage_path = api_dir.join("coverage.json");
    let mut coverage: Value = serde_json::from_str(&fs::read_to_string(&coverage_path)?)?;

    let args: Vec<String> = std::env::args().skip(1).collect();
    let remote = args.iter().any(|a| a == "--remote");
    let selected: Vec<_> = document
        .operations
        .iter()
        .filter(|op| args.iter().any(|a| a == "--all" || *a == op.id))
        .collect();
    if selected.is_empty() {
        anyhow::bail!("no operations selected; pass --all or operation ids");
    }

    let client = reqwest::Client::builder()
        .user_agent("ditzybooru-api-verify")
        // Like the server: a submission's redirect is read, not followed.
        .redirect(reqwest::redirect::Policy::none())
        .build()?;
    let mut all_ok = true;
    for op in selected {
        let mut passed: Vec<&str> = vec![];
        for (name, instance) in &instances {
            let label = format!("{} @ {name}", op.id);
            if instance.remote && !remote {
                println!("SKIP {label}: remote instance, pass --remote to include it");
                continue;
            }
            let api_key = match key_for(op, name) {
                Ok(key) => key,
                Err(reason) => {
                    println!("SKIP {label}: {reason}");
                    continue;
                }
            };
            let Some(strategy) = select_strategy(op, &instance.flavor) else {
                println!("SKIP {label}: no strategy for flavor {}", instance.flavor);
                continue;
            };
            let session = match session_for(&client, &document, op, instance, name).await {
                Ok(session) => session,
                Err(reason) => {
                    println!("SKIP {label}: {reason}");
                    continue;
                }
            };
            let params = with_login(op, name, &op.examples);
            let ctx = Context {
                origin: &instance.origin,
                flavor: &instance.flavor,
                // Optional operations are verified as the public sees them.
                api_key: api_key.as_deref(),
                session: session.as_ref(),
            };
            let result = async {
                let responses =
                    fetch(&client, &Throttle::default(), ctx, strategy, &params).await?;
                let value = extract(strategy, &responses, ctx, &params)?;
                validate(&document, op, &value)?;
                if value
                    .get("items")
                    .and_then(Value::as_array)
                    .is_some_and(Vec::is_empty)
                {
                    anyhow::bail!("`items` is empty, so no item fields were checked; seed data");
                }
                Ok::<_, anyhow::Error>(responses)
            }
            .await;
            match result {
                Ok(responses) => {
                    write_fixtures(
                        &api_dir.join("fixtures").join(name),
                        &op.id,
                        strategy,
                        responses,
                    )?;
                    println!("OK   {label}");
                    passed.push(name);
                }
                Err(err) => {
                    all_ok = false;
                    println!("FAIL {label}: {err:#}");
                }
            }
        }
        mark_verified(&mut coverage, op, &passed);
    }
    let mut text = serde_json::to_string_pretty(&coverage).context("serializing coverage")?;
    text.push('\n');
    fs::write(coverage_path, text)?;
    Ok(all_ok)
}
