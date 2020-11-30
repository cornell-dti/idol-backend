import { db } from './firebase';

const removeEmptyOrNull = (obj) => {
  Object.keys(obj).forEach(
    (k) =>
      (obj[k] && typeof obj[k] === 'object' && removeEmptyOrNull(obj[k])) ||
      (!obj[k] && obj[k] !== undefined && delete obj[k])
  );
  return obj;
};

const dirPath: string = './members/';
const filesPath: string = './data/members/';
const fs = require('fs');
const jsonFilesList: string[] = fs.readdirSync(filesPath);
const emailDomain: string = '@cornell.edu';

db.collection('members')
  .get()
  .then((vals) => {
    return vals.docs.map((doc) => {
      return doc.data().email;
    });
  })
  .then((existingEmails: string[]) => {
    jsonFilesList.forEach((fileName) => {
      let jsonData = require(dirPath + fileName);
      const email: string = jsonData.netid + emailDomain;

      let data = {
        first_name: jsonData.firstName,
        last_name: jsonData.lastName,
        email: email,
        role: jsonData.roleId,
        about: jsonData.about,
        github_link: jsonData.github,
        linkedin_link: jsonData.linkedin,
        major: jsonData.major,
        minor: jsonData.minor,
        double_major: jsonData.doubleMajor,
        hometown: jsonData.hometown,
        graduation: jsonData.graduation,
        subteam: jsonData.subteam,
        other_subteams: jsonData.otherSubteams,
        website: jsonData.website,
      };

      removeEmptyOrNull(data);

      if (data.website) {
        if (existingEmails.includes(email)) {
          db.doc('members/' + email).update(data);
        } else {
          db.doc('members/' + email).set(data);
        }
      }
    });
  });