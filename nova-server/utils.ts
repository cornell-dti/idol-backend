export const getNetId = (email: string): string => {
  let pos = email.search('@');
  return email.slice(0, pos);
};
