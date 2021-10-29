import React from 'react';

type Serializer<T> = {
  encode: (value: T) => string;
  decode: (value: string) => T;
};

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

type Storage = {
  get: (key: string) => string | null | undefined;
  set: (key: string, value: string) => void;
};

type Data = {
  value: string;
  expires?: number;
};

const jsonSerializer: Serializer<unknown> = {
  encode: JSON.stringify,
  decode: JSON.parse,
};

export const createUseStorage = (storage: Storage) => {
  const useStorage = <T>(
    key: string,
    initialValue: T,
    options?: Options<T>
  ) => {
    const serializer: Serializer<T> =
      options?.serializer ?? (jsonSerializer as Serializer<T>);

    const [value, setValue] = React.useState(() => {
      const encodedValue = storage.get(key);
      if (!encodedValue) return undefined;
      return JSON.parse(encodedValue);
    });
    const wrappedSet = React.useCallback(
      (value: T) => {
        const nextValue: Data = { value: serializer.encode(value) };
        if (options?.ttl && serializer.encode(initialValue) !== nextValue.value) {
          nextValue.expires = Date.now() + options.ttl;
        }

        setValue(nextValue);
        const oldEncodedValue = storage.get(key);
        const oldValue = oldEncodedValue && JSON.parse(oldEncodedValue);
        if (oldValue?.value !== nextValue.value) {
          storage.set(key, JSON.stringify(nextValue));
          document.dispatchEvent(new Event(`storageChange.${key}`));
        }
      },
      [initialValue, key, options?.ttl, serializer]
    );
    if (!value) {
      wrappedSet(initialValue);
    }
    if (value?.expires && Date.now() > value?.expires) {
      wrappedSet(initialValue);
    }
    const decodedValue = React.useMemo(() => {
      try {
        return serializer.decode(value?.value);
      } catch {
        return initialValue;
      }
    }, [initialValue, serializer, value?.value]);
    const lastValueRef = React.useRef('');

    const check = React.useCallback(() => {
      const item = storage.get(key);
      if (lastValueRef.current !== item) {
        // Either the value changed in localStorage
        const json = JSON.parse(item || 'null');
        setValue(json);
        lastValueRef.current = storage.get(key) ?? '';
      } else if (
        // Or the TTL expired
        !options?.checkTtlOnlyOnLoad &&
        value?.expires &&
        Date.now() > value.expires
      ) {
        wrappedSet(initialValue);
      }
    }, [
      initialValue,
      key,
      options?.checkTtlOnlyOnLoad,
      value?.expires,
      wrappedSet,
    ]);

    // Check for changes from a different tab
    React.useEffect(() => {
      window.addEventListener('storage', check);
      return () => {
        window.removeEventListener('storage', check);
      };
    }, [check]);

    // Check for changes from different component on then same tab
    React.useEffect(() => {
      document.addEventListener(`storageChange.${key}`, check, false);
      return () => {
        document.removeEventListener(`storageChange.${key}`, check, false);
      };
    }, [check, key]);

    // Check for changes from something updating the localStorage value
    React.useEffect(() => {
      if (options?.pollingInterval === false) {
        return;
      }
      const interval = setInterval(check, options?.pollingInterval || 1000);
      return () => clearInterval(interval);
    }, [check, options?.pollingInterval]);
    return [decodedValue, wrappedSet] as const;
  };
  return useStorage;
};

export const useLocalStorage = createUseStorage({
  get: localStorage.getItem.bind(localStorage),
  set: localStorage.setItem.bind(localStorage),
});

export const useSessionStorage = createUseStorage({
  get: sessionStorage.getItem.bind(sessionStorage),
  set: sessionStorage.setItem.bind(sessionStorage),
});
