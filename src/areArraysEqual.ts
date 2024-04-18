/**
 * Checks if two arrays are equal with `===` equality for items
 */
export const areArraysEqual = (a: any[], b: any[]): boolean => {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
};
