import { generateNickName } from '../generateNickName';
test('generateNickName handles single-digit months and days correctly', () => {
  const fixedDate = new Date('2025-01-05T00:00:00.456');
  jest.useFakeTimers().setSystemTime(fixedDate);

  const result = generateNickName();
  expect(result).toBe('ux@20250105456');
});
