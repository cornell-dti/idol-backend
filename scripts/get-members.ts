import { db } from './firebase';

<<<<<<< HEAD
let getNetId = (email: string): string => {
  let pos = email.search('@');
=======
const getNetId = (email: string): string => {
  const pos = email.search('@');
>>>>>>> master
  return email.slice(0, pos);
};

const fs = require('fs');
<<<<<<< HEAD
const dirPath: string = 'scripts/members/';
=======

const dirPath = 'scripts/members/';
>>>>>>> master
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
<<<<<<< HEAD
      let member = memberRef.data();
      let netId = getNetId(member.email);
      fs.writeFile(dirPath + `${netId}.json`, JSON.stringify(member), (err) => {
=======
      const member = memberRef.data();
      const netId = getNetId(member.email);
      fs.writeFile(`${dirPath}${netId}.json`, JSON.stringify(member), (err) => {
>>>>>>> master
        if (err) {
          console.log(err);
        }
      });
    });
  });
