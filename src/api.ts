import express from 'express';
import serverless from 'serverless-http';

const app = express();
const router = express.Router();

let numReq = 1;


router.get('/*', (req, res) => {
  res.json({
    test: 'hello',
    numReq: numReq
  });
  numReq++;
});

app.use('/.netlify/functions/api', router);

module.exports.handler = serverless(app);