use-synced-storage
===

[![NPM version][npm-image]][npm-url]
[![Build status][build-image]][build-url]
[![Downloads][downloads-image]][downloads-url]

React Hook to manage {local,sessions,*}storage with syncing across components and tabs

## Quick Start

```tsx
import React from 'react';
import { useLocalStorage } from 'use-storage/src/index';

export const MyComponent: React.FunctionComponent = () => {
  const [state, setState] = useLocalStorage('state', { count: 0 });

  return (
    <div>
      state.count is {state.count}
      <button onClick={() => setState({ count: (state.count) + 1 })}>++</button>
    </div>
  );
}
```

The state will sync across components and tabs

---

### API

This module exports a `createUseStorage` function as well as a `useLocalStorage` and `useSessionStorage` hook.

The storage hooks api take the following options:

```ts
type Options<T> = {
  /** Customize encoding and decoding the object */
  serializer?: Serializer<T>;
  /** Time to live for entry in milliseconds */
  ttl?: number;
  /** Interval polling for updates in the background, this needs to be enabled for checking ttl didn't expire after the component rendered. Defaults to 1000 */
  pollingInterval?: number | false;
  /** Only check ttl when loading value and NOT periodically throughout the life of the component */
  checkTtlOnlyOnLoad?: boolean;
};
```

[npm-image]: https://img.shields.io/npm/v/use-synced-storage.svg?style=flat-square
[npm-url]: https://npmjs.org/package/use-synced-storage
[build-image]: https://github.com/kolodny/use-synced-storage/actions/workflows/main.yml/badge.svg
[build-url]: https://github.com/kolodny/use-synced-storage/actions/workflows/main.yml
[downloads-image]: http://img.shields.io/npm/dm/use-synced-storage.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/use-synced-storage