import express from 'express';
import serverless from 'serverless-http';
import { db as database } from './firebase';

const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;

let numReq = 1;


router.get('/*', (req, res) => {
  res.json({
    test: 'hello',
    numReq: numReq,
    pk: process.env.FIREBASE_PRIVATE_KEY
  });
  numReq++;
});

app.use('/.netlify/functions/api', router);

app.listen(PORT, () => {
  console.log("IDOL backend listening on port: " + PORT);
});

module.exports.handler = serverless(app);