import { db } from './firebase';

const dirPath: string = __dirname + '/data/members/';

const fs = require('fs');

let getFilePath = function (email: string): string {
    var pos = email.indexOf('@');
    var path = dirPath + email.slice(0, pos) + '.json';
    return path;
}

db.collection('members').get().then((vals) => {
    vals.forEach((doc) => {
        var data = doc.data();
        var filePath = getFilePath(data.email);
        fs.writeFile(getFilePath(data.email), JSON.stringify(data), function (err) {
            if (err) {
                console.log(err);
            }
        });
    });
})


