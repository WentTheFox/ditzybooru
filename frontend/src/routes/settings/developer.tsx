import { createFileRoute } from '@tanstack/react-router';

import { Alert, AlertText } from '#/components/philomena/Alert';
import { FormControlGroup, FormMessage, Radio } from '#/components/philomena/Forms';
import { SettingsLayout } from '#/components/settings/SettingsLayout';
import { Block, BlockContent, BlockHeader } from '#/components/philomena/Surfaces';
import { useDataSource } from '#/hooks/use-data-source';
import { setDataSource } from '#/lib/settings-store';
import type { DataSourceKind } from '#/lib/api/types';

export const Route = createFileRoute('/settings/developer')({ component: DeveloperSettingsPage });

const DATA_SOURCE_OPTIONS: Array<{ value: DataSourceKind; label: string; description: string }> = [
  {
    value: 'live',
    label: 'Live',
    description: 'Read from our API. Off on the Cloudflare deploy unless its Worker variables enable it.',
  },
  { value: 'mock', label: 'Mock', description: 'Read the fabricated data bundled with the frontend.' },
  {
    value: 'mock-anonymous',
    label: 'Mock, signed out',
    description: 'The same fabricated data, browsed without a signed-in user.',
  },
];

function DeveloperSettingsPage() {
  const dataSource = useDataSource();

  return (
    <SettingsLayout title="Developer">
      <Alert>
        <AlertText>
          <strong>For working on the site</strong> These change where the page gets its content, not how it looks. They
          are stored in the same cookie as every other setting, so the server renders from whichever one is chosen here.
        </AlertText>
      </Alert>

      <Block>
        <BlockHeader>Data source</BlockHeader>
        <BlockContent>
          <FormControlGroup vertical role="radiogroup" aria-label="Data source">
            <FormMessage>
              Mock data never changes and needs no network, which is what makes a layout comparable between two runs.
              Live data is read-only and anonymous: the origin&apos;s default filter applies, and faves and watched tags
              are empty until sign-in exists.
            </FormMessage>
            {DATA_SOURCE_OPTIONS.map(option => (
              <Radio
                key={option.value}
                name="data-source"
                value={option.value}
                checked={dataSource === option.value}
                onChange={() => {
                  setDataSource(option.value);
                }}
                label={
                  <>
                    <strong>{option.label}</strong> - {option.description}
                  </>
                }
              />
            ))}
          </FormControlGroup>
        </BlockContent>
      </Block>
    </SettingsLayout>
  );
}
