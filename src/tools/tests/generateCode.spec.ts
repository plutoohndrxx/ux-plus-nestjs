import { generateCode } from '../generateCode';
describe('generateCode', () => {
  it('should return a string of length 6', () => {
    const code = generateCode();
    expect(typeof code).toBe('string');
    expect(code.length).toBe(6);
  });

  it('should only contain digits', () => {
    const code = generateCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  it('generates valid codes on multiple runs', () => {
    for (let i = 0; i < 100; i++) {
      const code = generateCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^\d{6}$/);
    }
  });
});
