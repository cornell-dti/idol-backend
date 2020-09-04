require('dotenv').config();
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import { db as database } from './firebase';

const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;
const isProd: boolean = JSON.parse(process.env.IS_PROD);

if (isProd) {
  app.use(cors({
    origin: 'https://idol.cornelldti.org'
  }));
} else {
  app.use(cors({
    origin: 'http://localhost:3000'
  }));
}

router.get('/members/all', async (req, res) => {
  res.json({
    members: await db.collection('members').get().then((vals) => {
      return vals.docs.map(doc => {
        return doc.data();
      });
    })
  });
});

app.use('/.netlify/functions/api', router);

if (!isProd) {
  app.listen(PORT, () => {
    console.log("IDOL backend listening on port: " + PORT);
  });
}

module.exports.handler = serverless(app);