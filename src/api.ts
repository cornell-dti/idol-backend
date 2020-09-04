require('dotenv').config();
import express from 'express';
import serverless from 'serverless-http';
import { db as database } from './firebase';

const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;


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

app.listen(PORT, () => {
  console.log("IDOL backend listening on port: " + PORT);
});

module.exports.handler = serverless(app);