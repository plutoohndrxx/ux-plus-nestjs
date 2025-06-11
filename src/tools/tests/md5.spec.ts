import { md5 } from '../md5';

describe('MD5 Hash Function', () => {
  it('should generate the correct MD5 hash for a given string', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('The quick brown fox jumps over the lazy dog')).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    );
  });

  it('should handle different inputs consistently', () => {
    const input = 'test';
    const firstHash = md5(input);
    const secondHash = md5(input);

    expect(firstHash).toBe(secondHash);
  });
});
