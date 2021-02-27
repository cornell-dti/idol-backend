export const getNetId = (email: string): string => {
  const pos = email.search('@');
  return email.slice(0, pos);
};
