import { FilterXSS } from 'xss';

export const filterXss = (str: string) => {
  const filter = new FilterXSS();
  return filter.process(str);
};
