/**
 * Writes `src/styles/accents.min.css`: the per-accent color layer on top of the
 * PhilomenaCSS stylesheet.
 *
 * The package computes every color derived from its base color at build time,
 * so a site's accent cannot be applied with a runtime variable. Instead this
 * compiles the framework once for the default accent and once per other accent
 * (only `$base-color-dark` and `$base-color-light` change) and keeps just the
 * declarations that differ, rewritten to apply under `:root[data-accent="x"]`.
 * The layer is small and the main stylesheet is shared by every site.
 *
 * Run after upgrading the package or changing an accent:
 *   pnpm --filter frontend run build:accents
 */

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import relativeColor from '@csstools/postcss-relative-color-syntax';
import postcss from 'postcss';
import type { AtRule, Container, Declaration, Document, Root, Rule } from 'postcss';
import postcssImport from 'postcss-import';
import postcssMixins from 'postcss-mixins';
import postcssSimpleVars from 'postcss-simple-vars';

/**
 * Hue of each accent, in degrees. The saturation and lightness are the
 * package's own base colors (a dark blue and a light blue), so every accent is
 * the same palette turned to another hue and the package's contrast checks
 * carry over. `blue` is the package default and emits nothing.
 */
const ACCENT_HUES: Record<string, number> = {
  red: 0,
  orange: 28,
  yellow: 48,
  green: 140,
  teal: 186,
  purple: 275,
  pink: 335,
};
/** Gray is the same lightness with the color taken out. */
const GRAY_SATURATION = 8;

const DEFAULT_BASE = { dark: { s: 29, l: 46 }, light: { s: 62, l: 62 } };

/**
 * The package fixes the lightness of every derived color, so its header (white
 * or pale-tinted text on the base hue at 38% lightness light, 30% dark) only
 * clears 4.5:1 for hues of low luminance such as its own blue. Yellow, green,
 * orange and teal at the same saturation do not. Contrast is checked against
 * the header, the one place the text sits on a saturated fill, and the
 * saturation is lowered until both its text colors hold with a margin.
 */
const HEADER = {
  light: { background: 38, text: 89, extra: 0, fixedText: '#d2e6f4' },
  dark: { background: 30, text: 88, extra: 20, fixedText: '#d1dcef' },
};
const MIN_HEADER_CONTRAST = 4.55;

function luminance(hex: string): number {
  const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** The highest saturation at or below `wanted` whose header text clears the minimum. */
function headerSafeSaturation(mode: 'light' | 'dark', hue: number, wanted: number): number {
  const { background, text, extra, fixedText } = HEADER[mode];
  for (let s = wanted; s > 0; s--) {
    const fill = Math.min(100, s + extra);
    const bar = hslToHex(hue, fill, background);
    // The brand text is a tint of the accent; the navigation items use a fixed pale blue.
    const worst = Math.min(contrast(bar, hslToHex(hue, fill, text)), contrast(bar, fixedText));
    if (worst >= MIN_HEADER_CONTRAST) return s;
  }
  return 0;
}

const require = createRequire(import.meta.url);
const packageRoot = join(require.resolve('@philomena/philomena-css/package.json'), '..');

function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    const value = lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

async function compile(base: { dark: string; light: string } | undefined): Promise<Root> {
  const dir = mkdtempSync(join(tmpdir(), 'accent-'));
  try {
    const overrides = join(dir, 'overrides.css');
    writeFileSync(
      overrides,
      base === undefined ? '' : `$base-color-dark: ${base.dark};\n$base-color-light: ${base.light};\n`,
    );
    const entry = [
      `@import '${join(packageRoot, 'css/config.css')}';`,
      `@import '${overrides}';`,
      `@import '${join(packageRoot, 'css/framework.css')}';`,
    ].join('\n');
    const result = await postcss([postcssImport(), postcssMixins(), postcssSimpleVars(), relativeColor()]).process(
      entry,
      { from: join(dir, 'entry.css') },
    );
    return result.root;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The at-rules a rule is nested in, outermost first, as `@media (...)`. */
function atRuleContext(rule: Rule): string[] {
  const context: string[] = [];
  for (let node: Container | Document | undefined = rule.parent; node; node = node.parent) {
    if (node.type === 'atrule') context.unshift(`@${(node as AtRule).name} ${(node as AtRule).params}`);
  }
  return context;
}

/** Every declaration with the rule it sits in, keyed by its position in the stylesheet. */
function declarations(root: Root): Map<string, { rule: Rule; decl: Declaration }> {
  const found = new Map<string, { rule: Rule; decl: Declaration }>();
  const counts = new Map<string, number>();
  root.walkDecls(decl => {
    const rule = decl.parent;
    if (rule?.type !== 'rule') return;
    const context = atRuleContext(rule);
    const base = `${context.join(' > ')} | ${rule.selector} | ${decl.prop}`;
    const nth = counts.get(base) ?? 0;
    counts.set(base, nth + 1);
    found.set(`${base} #${nth}`, { rule, decl });
  });
  return found;
}

function scopeSelector(selector: string, accent: string): string {
  const attribute = `[data-accent="${accent}"]`;
  return selector
    .split(',')
    .map(part => {
      const trimmed = part.trim();
      return trimmed.includes(':root') ? trimmed.replace(':root', `:root${attribute}`) : `:root${attribute} ${trimmed}`;
    })
    .join(',');
}

const defaults = declarations(await compile(undefined));
const sections: string[] = [];

for (const [accent, hue] of Object.entries({ ...ACCENT_HUES, gray: 0 })) {
  const saturation = (mode: 'dark' | 'light') =>
    headerSafeSaturation(mode, hue, accent === 'gray' ? GRAY_SATURATION : DEFAULT_BASE[mode].s);
  const base = {
    dark: hslToHex(hue, saturation('dark'), DEFAULT_BASE.dark.l),
    light: hslToHex(hue, saturation('light'), DEFAULT_BASE.light.l),
  };
  const built = declarations(await compile(base));

  // Group changed declarations by (at-rule context, selector), keeping source order.
  const groups = new Map<string, { context: string[]; selector: string; lines: string[] }>();
  for (const [key, { rule, decl }] of built) {
    if (defaults.get(key)?.decl.value === decl.value) continue;
    const context = atRuleContext(rule);
    const groupKey = `${context.join(' > ')} | ${rule.selector}`;
    const group = groups.get(groupKey) ?? { context, selector: rule.selector, lines: [] };
    group.lines.push(`${decl.prop}:${decl.value};`);
    groups.set(groupKey, group);
  }

  const blocks = [...groups.values()].map(group => {
    const body = `${scopeSelector(group.selector, accent)}{${group.lines.join('')}}`;
    return group.context.reduceRight((inner, wrapper) => `${wrapper}{${inner}}`, body);
  });
  sections.push(blocks.join(''));
}

// One line on purpose: a file that cannot be read cannot be mistaken for one to edit.
const header =
  '/* GENERATED by scripts/build-accents.ts, do not edit. Regenerate: pnpm --filter frontend run build:accents. ' +
  'Color tokens per accent, applied by <html data-accent>; blue is the package default and has none. */';

const out = fileURLToPath(new URL('../src/styles/accents.min.css', import.meta.url));
writeFileSync(out, `${header}${sections.join('')}\n`);
console.log(`wrote ${out} (${readFileSync(out).length} bytes)`);
