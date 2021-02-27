<<<<<<< HEAD
require('dotenv').config();
import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import session, { MemoryStore } from 'express-session';
import { db as database, app as adminApp } from './firebase';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
=======
import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import session, { MemoryStore } from 'express-session';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { db as database, app as adminApp } from './firebase';
>>>>>>> master
import {
  allMembers,
  getMember,
  setMember,
  deleteMember,
<<<<<<< HEAD
  updateMember,
} from './memberAPI';
import { getAllRoles } from './roleAPI';
import { allTeams, setTeam, deleteTeam } from './teamAPI';
import { authenticateUser } from './auth';
=======
  updateMember
} from './memberAPI';
import { getAllRoles } from './roleAPI';
import { allTeams, setTeam, deleteTeam } from './teamAPI';

require('dotenv').config();
>>>>>>> master

// Constants and configurations
const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;
<<<<<<< HEAD
const isProd: boolean = JSON.parse(process.env.IS_PROD);
const allowAllOrigins = false;
export const enforceSession = true;
=======
const isProd: boolean = JSON.parse(process.env.IS_PROD as string);
const allowAllOrigins = false;
const enforceSession = true;
// eslint-disable-next-line no-nested-ternary
>>>>>>> master
const allowedOrigins = allowAllOrigins
  ? [/.*/]
  : isProd
  ? [/https:\/\/idol\.cornelldti\.org/, /.*--cornelldti-idol\.netlify\.app/]
  : [/http:\/\/localhost:3000/];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
<<<<<<< HEAD
    credentials: true,
=======
    credentials: true
>>>>>>> master
  })
);
app.use(bodyParser.json());
app.use(
  session({
<<<<<<< HEAD
    secret: process.env.SESSION_SECRET,
=======
    secret: process.env.SESSION_SECRET as string,
>>>>>>> master
    resave: true,
    saveUninitialized: true,
    store: new MemoryStore(),
    cookie: {
<<<<<<< HEAD
      secure: isProd ? true : false,
      maxAge: 3600000,
    },
  })
);
let sessionErrCb = (err) => {
  console.log(err);
};

// Check valid session
export let checkLoggedIn = (req: Request, res: Response): boolean => {
  if (!enforceSession) {
    return true;
  }
  if (req.session?.isLoggedIn) {
    return true;
  } else {
    // Session expired
    res.status(440).json({ error: 'Not logged in!' });
    return false;
  }
};

// Authenticate user
router.use('/', authenticateUser);

// Login
router.post('/login', async (req: Request, res: Response) => {
  let members = await db
    .collection('members')
    .get()
    .then((vals) => {
      return vals.docs.map((doc) => {
        return doc.data();
=======
      secure: !!isProd,
      maxAge: 3600000
    }
  })
);
const sessionErrCb = (err) => {
  console.log(err);
};

// Check valid session
export const checkLoggedIn = (req, res): boolean => {
  if (!enforceSession) {
    return true;
  }
  if (req.session?.isLoggedIn) {
    return true;
  }
  // Session expired
  res.status(440).json({ error: 'Not logged in!' });
  return false;
};

// Login
router.post('/login', async (req, res) => {
  const members = await db
    .collection('members')
    .get()
    .then((vals) => vals.docs.map((doc) => doc.data()));
  const { auth_token } = req.body;
  admin
    .auth(adminApp)
    .verifyIdToken(auth_token)
    .then((decoded) => {
      const foundMember = members.find((val) => val.email === decoded.email);
      if (!foundMember) {
        res.json({ isLoggedIn: false });
        return;
      }
      req.session!.isLoggedIn = true;
      req.session!.email = foundMember.email;
      req.session!.save((err) => {
        if (err) sessionErrCb(err);
        res.json({ isLoggedIn: true });
>>>>>>> master
      });
    });
  let auth_token = req.body.auth_token;
  admin
    .auth(adminApp)
    .verifyIdToken(auth_token)
    .then((decoded) => {
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
    })
<<<<<<< HEAD
    .catch((reason) => {
=======
    .catch(() => {
>>>>>>> master
      res.json({ isLoggedIn: false });
    });
});

// Logout
<<<<<<< HEAD
router.post('/logout', (req: Request, res: Response) => {
  req.session.isLoggedIn = false;
  req.session.destroy((err) => {
    err ? sessionErrCb(err) : null;
=======
router.post('/logout', (req, res) => {
  req.session!.isLoggedIn = false;
  req.session!.destroy((err) => {
    if (err) sessionErrCb(err);
>>>>>>> master
    res.json({ isLoggedIn: false });
  });
});

// Roles
router.get('/allRoles', getAllRoles);

// Members
<<<<<<< HEAD
router.get('/allMembers', async (req: Request, res: Response) => {
  let handled = await allMembers(req, res);
  res.status(handled.status).json(handled);
});

router.get('/getMember/:email', async (req: Request, res: Response) => {
  let handled = await getMember(req, res);
  res.status(handled.status).json(handled);
});

router.post('/setMember', async (req: Request, res: Response) => {
  let handled = await setMember(req, res);
  res.status(handled.status).json(handled);
});

router.delete('/deleteMember', async (req: Request, res: Response) => {
  let handled = await deleteMember(req, res);
  res.status(handled.status).json(handled);
});

router.post('/updateMember', async (req: Request, res: Response) => {
  let handled = await updateMember(req, res);
  res.status(handled.status).json(handled);
});

// Teams
router.get('/allTeams', async (req: Request, res: Response) => {
  let handled = await allTeams(req, res);
  res.status(handled.status).json(handled);
});
router.post('/setTeam', async (req: Request, res: Response) => {
  let handled = await setTeam(req, res);
  res.status(handled.status).json(handled);
});
router.delete('/deleteTeam', async (req: Request, res: Response) => {
  let handled = await deleteTeam(req, res);
  res.status(handled.status).json(handled);
});
=======
router.get('/allMembers', async (req, res) => {
  const handled = await allMembers(req, res);
  res.status(handled!.status).json(handled);
});
router.get('/getMember/:email', async (req, res) => {
  const handled = await getMember(req, res);
  res.status(handled!.status).json(handled);
});
router.post('/setMember', async (req, res) => {
  const handled = await setMember(req, res);
  res.status(handled!.status).json(handled);
});
router.delete('/deleteMember', async (req, res) => {
  const handled = await deleteMember(req, res);
  res.status(handled!.status).json(handled);
});

router.post('/updateMember', async (req, res) => {
  const handled = await updateMember(req, res);
  res.status(handled!.status).json(handled);
});

// Teams
router.get('/allTeams', allTeams);
router.post('/setTeam', setTeam);
router.delete('/deleteTeam', deleteTeam);
>>>>>>> master

app.use('/.netlify/functions/api', router);

// Startup local server if not production (prod is serverless)
if (!isProd) {
  app.listen(PORT, () => {
<<<<<<< HEAD
    console.log('IDOL backend listening on port: ' + PORT);
=======
    console.log(`IDOL backend listening on port: ${PORT}`);
>>>>>>> master
  });
}

module.exports.handler = serverless(app);
