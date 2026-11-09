import { useState } from 'react';
import type { Ref } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Camera, Search } from 'lucide-react';

import { Button, ButtonContent, ButtonIcon, buttonClass } from '#/components/philomena/Button';
import { FormInputGroup, InputField } from '#/components/philomena/Forms';
import { cn } from '#/lib/utils';
import type { ClassValue } from '#/lib/utils';

/** `Button` takes its HTML `type` through `submit`, because `type` is its color. */
const SUBMIT = { submit: true };

/**
 * The site search field. Rendered twice: in the header bar on a wide screen,
 * and in the bottom navigation's search sheet on a phone, where the bar has no
 * room for it.
 */
export function SearchBar({ className, inputRef }: { className?: ClassValue; inputRef?: Ref<HTMLInputElement> }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  return (
    <form
      onSubmit={event => {
        event.preventDefault();
        // An empty field means the default listing, not a search for "".
        void navigate({ to: '/search', search: { q: query.trim() || '*', page: 1 } });
      }}
      className={cn('flex flex-center gap-sm', className)}
      role="search"
    >
      {/* The group carries a bottom margin meant for stacked form fields. In this
          centered row it would lift the field above the camera button. */}
      <FormInputGroup className="flex-grow mb-0">
        <InputField
          ref={inputRef}
          type="search"
          value={query}
          onChange={event => {
            setQuery(event.target.value);
          }}
          placeholder="Search"
          aria-label="Search"
          autoCapitalize="none"
          spellCheck={false}
        />
        <Button iconOnly sizeInput title="Search" aria-label="Search" {...SUBMIT}>
          <ButtonIcon>
            <Search size={16} />
          </ButtonIcon>
        </Button>
      </FormInputGroup>
      <Link
        // @ts-expect-error TODO: route not built yet
        to="/search/reverse"
        title="Search using an image"
        aria-label="Reverse image search"
        className={buttonClass({ iconOnly: true })}
      >
        <ButtonContent>
          <ButtonIcon>
            <Camera size={16} />
          </ButtonIcon>
        </ButtonContent>
      </Link>
    </form>
  );
}
