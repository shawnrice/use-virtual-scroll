import { useMemo } from 'react';

export const usePagedData = <T extends Record<string, unknown>>(items: T[], pageSize: number) =>
  useMemo<T[][]>(() => {
    let n = -1;
    return items.reduce<T[][]>((acc, item, index) => {
      if (!(index % pageSize)) {
        n++;
      }

      acc[n] ??= [];
      acc[n].push(item);

      return acc;
    }, []);
  }, [items, pageSize]);
