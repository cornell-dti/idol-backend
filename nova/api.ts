import express, { Request, Response } from 'express';

import { db } from './firebase';
import { reduceMessage } from './MessageReducer';
import { getFilePath } from './utils';

const server = express();
const router = express.Router();
const PORT = 9000;

const fs = require('fs');

const getMembers = function () {
  db.collection('members')
    .get()
    .then((vals) => {
      vals.forEach((doc) => {
        const data = doc.data();
        fs.writeFile(
          getFilePath(data.email),
          JSON.stringify(data),
          function (err) {
            if (err) {
              console.log(err);
            }
          }
        );
      });
    });
};

router.post('/api/message', async (req: Request, res: Response) => {
  const handled = await reduceMessage(req, res);
  res.status(handled.status).json(handled);
});

server.use('/.netlify/functions/api', router);

server.listen(PORT, () => {
  console.log(`NOVA server listening on port: ${PORT}`);
  getMembers();
});
