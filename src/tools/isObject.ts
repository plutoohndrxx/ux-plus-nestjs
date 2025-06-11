export const isObject = <R>(o: R): boolean => {
  const tag = Object.prototype.toString.call(o);
  return tag === '[object Object]';
};
