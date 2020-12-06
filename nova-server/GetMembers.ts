import { db } from './firebase';
import { getNetId } from './utils';

const fs = require('fs');
const dirPath: string = 'nova-server/members/';

export let getMembers = () => {
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
        let member = memberRef.data();
        let netId = getNetId(member.email);
        fs.writeFile(
          dirPath + `${netId}.json`,
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
