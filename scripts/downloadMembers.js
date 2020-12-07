"use strict";
exports.__esModule = true;
var firebase_1 = require("./firebase");
var dirPath = __dirname + '/data/members/';
var fs = require('fs');
var getFilePath = function (email) {
    var pos = email.indexOf('@');
    var path = dirPath + email.slice(0, pos) + '.json';
    return path;
};
firebase_1.db.collection('members').get().then(function (vals) {
    vals.forEach(function (doc) {
        var data = doc.data();
        var filePath = getFilePath(data.email);
        fs.writeFile(getFilePath(data.email), JSON.stringify(data), function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
});
