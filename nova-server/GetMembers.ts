import { db } from './firebase';
import { getNetId } from './utils';

const fs = require('fs');

const dirPath = 'nova-server/members/';

export const getMembers = () => {
  fs.mkdirSync(dirPath, { recursive: true });
  const jsonFilesList: string[] = fs.readdirSync(dirPath);
  jsonFilesList.forEach((json) =>
    fs.unlink(dirPath + json, (err) => {
      if (err) {
        console.log(err);
      }
    })
  );
  db.collection('members')
    .get()
    .then((memberRefs) => {
      memberRefs.forEach((memberRef) => {
        const member = memberRef.data();
        const netId = getNetId(member.email);
        fs.writeFile(
          `${dirPath}${netId}.json`,
          JSON.stringify(member),
          (err) => {
            if (err) {
              console.log(err);
            }
          }
        );
      });
    });
};
