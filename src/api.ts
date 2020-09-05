require('dotenv').config();
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import session, { MemoryStore } from 'express-session';
import { db as database, app as adminApp } from './firebase';
import bodyParser from 'body-parser';
import admin from "firebase-admin";

export type role = 'lead' | 'admin' | 'tpm' | 'pm' | 'developer' | 'designer';
export const allRoles: role[] = ['lead', 'admin', 'tpm', 'pm', 'developer', 'designer'];

export class PermissionsManager {

  static canEditMembers(role: role): boolean {
    if (role === 'lead' || role === 'admin') {
      return true;
    } else {
      return false;
    }
  }

}

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

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
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
    req.session.email = foundMember.email;
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

router.get('/allMembers', async (req, res) => {
  if (req.session?.isLoggedIn) {
    res.json({
      members: await db.collection('members').get().then((vals) => {
        return vals.docs.map(doc => {
          return doc.data();
        });
      })
    });
  } else {
    res.status(200).json({ error: "Not logged in!" });
  }
});

router.get('/allRoles', async (req, res) => {
  if (req.session?.isLoggedIn) {
    res.status(200).json({ roles: allRoles });
  } else {
    res.status(200).json({ error: "Not logged in!" });
  }
});

router.post('/setMember', async (req, res) => {
  if (req.session?.isLoggedIn) {
    let member = await (await db.doc('members/' + req.session.email).get()).data();
    if (!member) {
      res.status(200).json({ error: "No member with email: " + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(200).json({ error: "User with email: " + req.session.email + " does not have permission to edit members!" });
      } else {
        if (!req.body.email || req.body.email === '') {
          res.status(200).json({ error: "Couldn't edit user with undefined email!" });
          return;
        }
        db.doc('members/' + req.body.email).set(req.body).then(() => {
          res.status(200).json({ status: "Success", member: req.body });
        }).catch((reason) => {
          res.status(200).json({ error: "Couldn't edit user for reason: " + reason });
        });
      }
    }
  } else {
    res.status(200).json({ error: "Not logged in!" });
  }
});

router.post('/deleteMember', async (req, res) => {
  if (req.session?.isLoggedIn) {
    let member = await (await db.doc('members/' + req.session.email).get()).data();
    if (!member) {
      res.status(200).json({ error: "Not member with email: " + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(200).json({ error: "User with email: " + req.session.email + " does not have permission to edit members!" });
      } else {
        if (!req.body.email || req.body.email === '') {
          res.status(200).json({ error: "Couldn't delete user with undefined email!" });
          return;
        }
        db.doc('members/' + req.body.email).delete().then(() => {
          res.status(200).json({ status: "Success", member: req.body });
        }).catch((reason) => {
          res.status(200).json({ error: "Couldn't delete user for reason: " + reason });
        });
      }
    }
  } else {
    res.status(200).json({ error: "Not logged in!" });
  }
});

app.use('/.netlify/functions/api', router);

if (!isProd) {
  app.listen(PORT, () => {
    console.log("IDOL backend listening on port: " + PORT);
  });
}

module.exports.handler = serverless(app);