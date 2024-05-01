import { coerceArray, hasChanged } from '../src';

describe('coerceArray function', () => {
  it('should return an array containing the input value if it is not an array', () => {
    expect(coerceArray(5)).toEqual([5]);
    expect(coerceArray('test')).toEqual(['test']);
    expect(coerceArray({ key: 'value' })).toEqual([{ key: 'value' }]);
  });

  it('should return the input array unchanged if it is already an array', () => {
    const inputArray = [1, 2, 3];
    expect(coerceArray(inputArray)).toEqual(inputArray);
  });
});

describe('hasChanged function', () => {
  it('should return true if the value has changed from the oldValue', () => {
    expect(hasChanged(5, 10)).toBe(true);
    expect(hasChanged('old', 'new')).toBe(true);
    expect(hasChanged({ prop: 'old' }, { prop: 'new' })).toBe(true);
  });

  it('should return false if the value has not changed from the oldValue', () => {
    expect(hasChanged(5, 5)).toBe(false);
    expect(hasChanged('same', 'same')).toBe(false);
    expect(hasChanged({ prop: 'same' }, { prop: 'same' })).toBe(true);
  });

  it('should handle special cases like NaN', () => {
    expect(hasChanged(Number.NaN, Number.NaN)).toBe(false);
    expect(hasChanged(Number.NaN, 5)).toBe(true);
  });
});
