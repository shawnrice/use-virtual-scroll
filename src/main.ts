import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { areArraysEqual } from './areArraysEqual';
import { usePagedData } from './usePagedData';

export type UseVirtualScrollParams<T extends Record<string, unknown>> = {
  /**
   * The list of items to be rendered
   */
  items: T[];
  /**
   * A ref to the element that holds the items, e.g. a table.
   *
   * If set to `null` virtualization will be skipped. This is useful when
   * virtualization needs to be skipped, maybe because the number of items in
   * the container hasn't reached a certain threshold.
   */
  container: React.RefObject<HTMLElement> | null;
  /**
   * The height of a single item
   */
  itemHeight: number;
  /**
   * The height of the scrollable area
   */
  containerHeight: number;

  /**
   * The div that gets scrolled. We use this for an optimization
   */
  virtualRef: React.RefObject<HTMLElement> | null;
};

export type UseVirtualReturn<T extends Record<string, unknown>> = {
  items: {
    /**
     * The item to be rendered
     */
    item: T;
    /**
     * Styles that need to be applied in order to properly apply the positioning
     */
    style: React.CSSProperties;
    /**
     * The absolute index is usually stable, but it will change if the list changes
     */
    absoluteIndex: number;
    /**
     * The index in the rendered items
     */
    relativeIndex: number;
  }[];
  pageCount: number;
};

const pageReducer = (state: number[], action: { payload: number[] }) => {
  if (action.payload && !areArraysEqual(state, action.payload)) {
    return action.payload;
  }

  return state;
};

/**
 * Pages items for use on virtual scroll
 *
 * @param params
 * @returns
 */
export const useVirtualScroll = <T extends Record<string, unknown> = Record<string, unknown>>(
  params: UseVirtualScrollParams<T>,
): UseVirtualReturn<T> => {
  const { itemHeight, container, containerHeight, items, virtualRef } = params;
  const [pages, dispatch] = React.useReducer(pageReducer, [-1, 0, 1]);
  const scrollPosition = React.useRef<number>(0);
  const raf = React.useRef<number | undefined>(undefined);
  const timerRef = React.useRef<number | undefined>();

  const currentPages = React.useRef<number[]>(pages);
  currentPages.current = pages;

  // If a null containerElement is passed, we skip creating scroll events &
  // handlers. We set the containerHeight to zero to keep the skipped callback
  // memoized.
  const containerElement = container?.current ?? null;

  /**
   * How many items are in a page
   */
  const pageSize = Math.floor(containerHeight / itemHeight);
  /**
   * How many pixels a page is
   */
  const pageLength = pageSize * itemHeight;

  React.useDebugValue({ containerHeight, pageLength, pageSize });

  const pagedData = usePagedData(items, pageSize);

  const onScroll = React.useCallback(
    (event: Event) => {
      if (
        !event.currentTarget ||
        !(event.currentTarget instanceof HTMLElement) ||
        !containerElement
      ) {
        return;
      }

      const { scrollTop } = event.currentTarget;
      scrollPosition.current = scrollTop;

      if (virtualRef?.current) {
        virtualRef.current.style.pointerEvents = 'none';
      }

      window.clearTimeout(timerRef.current);
      // @ts-expect-error: this expect raf to be a number, but it's potentially undefined, which is fine
      window.cancelAnimationFrame(raf.current);

      raf.current = window.requestAnimationFrame(() => {
        ReactDOM.flushSync(() => {
          const current = Math.round(scrollPosition.current / pageLength);

          const nextPages = [current - 1, current, current + 1];

          if (!areArraysEqual(currentPages.current, nextPages)) {
            dispatch({ payload: nextPages });
          }

          timerRef.current = window.setTimeout(() => {
            if (virtualRef?.current) {
              virtualRef.current.style.pointerEvents = 'auto';
            }
          }, 100);
        });
      });
    },
    [containerElement, pageLength, virtualRef],
  );

  // Add a passive scroll listener on the element
  React.useEffect(() => {
    const element = containerElement;
    element?.addEventListener('scroll', onScroll, {
      capture: false,
      passive: true,
    });

    return () => element?.removeEventListener('scroll', onScroll);
  }, [onScroll, containerElement]);

  const startIndex = pages.filter(x => Array.isArray(pagedData[x]))[0] * pageSize;

  return {
    items: pages
      .filter(x => Array.isArray(pagedData[x]))
      .reduce<T[]>((acc, page) => acc.concat(pagedData[page]), [])
      .map((item, index) => ({
        absoluteIndex: index + startIndex,
        item,
        relativeIndex: index,
        style: {
          height: `${itemHeight}px`,
          position: 'absolute',
          transform: `translateY(${itemHeight * (index + startIndex)}px)`,
          width: 'inherit',
        },
      })),
    pageCount: pagedData.length,
  };
};
