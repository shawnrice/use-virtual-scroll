import { describe, expect, test } from 'bun:test';

import { areArraysEqual } from './areArraysEqual';

describe('areArraysEqual', () => {
  test('non arrays return false', () => {
    // @ts-expect-error: testing invalid input
    expect(areArraysEqual(1, 1)).toBe(false);
  });

  test('arrays of different lengths are not equal', () => {
    expect(areArraysEqual([1], [1, 2])).toBe(false);
  });

  test('arrays can be equal', () => {
    expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  test('strings and numbers are not the same thing', () => {
    expect(areArraysEqual([1, 2, 3], ['1', '2', '3'])).toBe(false);
  });

  test('deep equality is not tested', () => {
    expect(areArraysEqual([1, 2, [3, 4]], [1, 2, [3, 4]])).toBe(false);
  });
});
