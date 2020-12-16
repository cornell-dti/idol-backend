import { db } from './firebase';
import express from 'express';
import { reduceMessage } from "./MessageReducer"

const server = express();
const router = express.Router();
const PORT = 9000;

const dirPath: string = __dirname + '/static/memberJSON/';
const fs = require('fs');

let getFilePath = function (email: string): string {
    var pos = email.indexOf('@');
    var path = dirPath + email.slice(0, pos) + '.json';
    return path;
}

let getMembers = function () {
    db.collection('members').get().then((vals) => {
        vals.forEach((doc) => {
            var data = doc.data();
            fs.writeFile(getFilePath(data.email), JSON.stringify(data), function (err) {
                if (err) {
                    console.log(err);
                }
            });
        });
    })
}

router.post('/api/message', async (req, res) => {
    let handled = await reduceMessage(req, res);
    res.status(handled.status).json(handled);
});

server.use('/.netlify/functions/api', router);

server.listen(PORT, () => {
    console.log('IDOL scripts listening on port: ' + PORT);
    getMembers();
});


