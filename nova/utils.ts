const dirPath = `${__dirname}/static/memberJSON/`;

export const getFilePath = function (email: string): string {
  const pos = email.indexOf('@');
  const path = `${dirPath + email.slice(0, pos)}.json`;
  return path;
};
