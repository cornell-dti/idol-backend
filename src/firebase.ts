import admin from "firebase-admin";
var serviceAccount = require("../resources/idol-b6c68-firebase-adminsdk-h4e6t-40e4bd5536.json");

let configureAccount = (sa) => {
  let configAcc = sa;
  let parsedPK;
  try {
    parsedPK = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
  } catch (err) {
    parsedPK = process.env.FIREBASE_PRIVATE_KEY;
  }
  configAcc['private_key'] = parsedPK;
  configAcc['private_key_id'] = process.env.FIREBASE_PRIVATE_KEY_ID;
  return configAcc;
};

admin.initializeApp({
  credential: admin.credential.cert(configureAccount(serviceAccount)),
  databaseURL: "https://idol-b6c68.firebaseio.com"
});

export const db = admin.firestore();