import { db } from './firebase';
import express from 'express';
import { Request, Response } from 'express';
import { reduceMessage } from './MessageReducer'
import { getFilePath } from './utils'

const server = express();
const router = express.Router();
const PORT = 9000;

const fs = require('fs');

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

router.post('/api/message', async (req: Request, res: Response) => {
    let handled = await reduceMessage(req, res);
    res.status(handled.status).json(handled);
});

server.use('/.netlify/functions/api', router);

server.listen(PORT, () => {
    console.log('IDOL scripts listening on port: ' + PORT);
    getMembers();
});


