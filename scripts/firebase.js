"use strict";
exports.__esModule = true;
exports.db = exports.app = void 0;
require('dotenv').config();
var admin = require("../node_modules/firebase-admin/lib");
var serviceAccount = require('../resources/idol-b6c68-firebase-adminsdk-h4e6t-40e4bd5536.json');
var configureAccount = function (sa) {
    var configAcc = sa;
    var parsedPK;
    try {
        parsedPK = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);
    }
    catch (err) {
        parsedPK = process.env.FIREBASE_PRIVATE_KEY;
    }
    configAcc['private_key'] = parsedPK;
    configAcc['private_key_id'] = process.env.FIREBASE_PRIVATE_KEY_ID;
    return configAcc;
};
exports.app = admin.initializeApp({
    credential: admin.credential.cert(configureAccount(serviceAccount)),
    databaseURL: "https://idol-b6c68.firebaseio.com"
});
exports.db = admin.firestore();
