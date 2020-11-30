import { db } from './firebase';

let getNetId = (email: string): string => {
  let pos = email.search('@');
  return email.slice(0, pos);
};

const fs = require('fs');
const dirPath: string = 'scripts/members/';
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
      fs.writeFile(dirPath + `${netId}.json`, JSON.stringify(member), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  });
