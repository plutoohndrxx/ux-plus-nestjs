export const toNumber = (n: string) => +n;

export const toBoolean = (s: string) => {
  if (s === 'true') return true;
  else if (s === 'false') return false;
  return false;
};

export const toObject = <T>(s: string) => JSON.parse(s) as T;
