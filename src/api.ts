require('dotenv').config();
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import session, { MemoryStore } from 'express-session';
import { db as database, app as adminApp } from './firebase';
import bodyParser from 'body-parser';
import admin from "firebase-admin";

const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;
const isProd: boolean = JSON.parse(process.env.IS_PROD);
const allowedOrigins = isProd
  ? [/https:\/\/idol\.cornelldti\.org/, /.*--cornelldti-idol\.netlify\.app/]
  : [/http:\/\/localhost:3000/];

let corsCheck = function (req, res, next) {
  if (req.headers.origin) {
    for (let regExp of allowedOrigins) {
      if (req.headers.origin.match(regExp) != null) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", ["Origin", "X-Requested-With",
          "Content-Type", "Accept"]);
        res.header("Access-Control-Allow-Methods", ["GET", "POST", "OPTIONS", "DELETE"]);
        break;
      }
    }
  }
  next();
}

app.use(corsCheck);
app.use(bodyParser.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: new MemoryStore(),
  cookie: {
    secure: isProd ? true : false,
    maxAge: 600000
  }
}));
let sessionErrCb = (err) => { console.log(err); };

router.post('/login', async (req, res) => {
  let members = await db.collection('members').get().then((vals) => {
    return vals.docs.map(doc => {
      return doc.data();
    });
  });
  let auth_token = req.body.auth_token;
  admin.auth(adminApp).verifyIdToken(auth_token).then((decoded) => {
    let foundMember = members.find((val) => val.email === decoded.email);
    if (!foundMember) {
      res.json({ isLoggedIn: false });
      return;
    }
    req.session.isLoggedIn = true;
    req.session.save((err) => {
      err ? sessionErrCb(err) : null;
      res.json({ isLoggedIn: true });
    });
  }).catch((reason) => {
    res.json({ isLoggedIn: false });
  });
});

router.post('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  req.session.destroy((err) => {
    err ? sessionErrCb(err) : null;
    res.json({ isLoggedIn: false });
  });
});

router.get('/members/all', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "idol.api.cornelldti.org");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", ["Origin", "X-Requested-With",
    "Content-Type", "Accept"]);
  res.header("Access-Control-Allow-Methods", ["GET", "POST", "OPTIONS", "DELETE"]);
  res.status(200).json([]);
  return;
  if (req.session?.isLoggedIn) {
    res.json({
      members: await db.collection('members').get().then((vals) => {
        return vals.docs.map(doc => {
          return doc.data();
        });
      })
    });
  } else {
    res.status(401).json({ error: "Not logged in!" });
  }
});

app.use('/.netlify/functions/api', router);

if (!isProd) {
  app.listen(PORT, () => {
    console.log("IDOL backend listening on port: " + PORT);
  });
}

module.exports.handler = serverless(app);