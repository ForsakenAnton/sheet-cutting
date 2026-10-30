import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { writeStorage } from '../lib/storage';

export function usePersistentState<T>(
  key: string,
  load: () => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(load);

  useEffect(() => {
    writeStorage(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
