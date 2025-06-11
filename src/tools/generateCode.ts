/**
 * It is used to generate the verification code required for account registration
 *
 * @returns {string}
 */
export const generateCode = () => {
  let code = '';
  for (let i = 0; i < 6; i++) {
    const digit = Math.floor(Math.random() * 10);
    code += digit;
  }
  return code;
};
