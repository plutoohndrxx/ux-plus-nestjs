import { isObject } from '../isObject';

describe('isObject', () => {
  it('should return true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1, b: 2 })).toBe(true);
    expect(isObject(Object.create(null))).toBe(true); // null-prototype object
  });

  it('should return false for non-objects', () => {
    expect(isObject(null)).toBe(false);
    expect(isObject(undefined)).toBe(false);
    expect(isObject(123)).toBe(false);
    expect(isObject('hello')).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(Symbol('test'))).toBe(false);
    expect(isObject(BigInt(1))).toBe(false);
  });

  it('should return false for built-in object types', () => {
    expect(isObject([])).toBe(false); // Array
    expect(isObject(new Date())).toBe(false); // Date
    expect(isObject(/regex/)).toBe(false); // RegExp
    expect(isObject(new Map())).toBe(false); // Map
    expect(isObject(new Set())).toBe(false); // Set
    expect(isObject(new Error('test'))).toBe(false); // Error
  });

  it('should handle functions correctly', () => {
    expect(isObject(() => {})).toBe(false); // Function
  });
});
