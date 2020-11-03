require("dotenv").config();
import express from "express";
import serverless from "serverless-http";
import cors from "cors";
import session, { MemoryStore } from "express-session";
import { db as database, app as adminApp } from "./firebase";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import { allMembers, getMember, setMember, deleteMember, updateMember } from "./memberAPI";
import { getAllRoles } from "./roleAPI";
import { allTeams, setTeam, deleteTeam } from "./teamAPI";

// Constants and configurations
const app = express();
const router = express.Router();
const db = database;
const PORT = process.env.PORT || 9000;
const isProd: boolean = JSON.parse(process.env.IS_PROD);
const allowAllOrigins = false;
const enforceSession = true;
const allowedOrigins = allowAllOrigins
  ? [/.*/]
  : isProd
    ? [/https:\/\/idol\.cornelldti\.org/, /.*--cornelldti-idol\.netlify\.app/]
    : [/http:\/\/localhost:3000/];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new MemoryStore(),
    cookie: {
      secure: isProd ? true : false,
      maxAge: 3600000,
    },
  })
);
let sessionErrCb = (err) => {
  console.log(err);
};

// Check valid session
export let checkLoggedIn = (req, res): boolean => {
  if (!enforceSession) {
    return true;
  }
  if (req.session?.isLoggedIn) {
    return true;
  } else {
    // Session expired
    res.status(440).json({ error: "Not logged in!" });
    return false;
  }
};

// Login
router.post("/login", async (req, res) => {
  let members = await db
    .collection("members")
    .get()
    .then((vals) => {
      return vals.docs.map((doc) => {
        return doc.data();
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
    .catch((reason) => {
      res.json({ isLoggedIn: false });
    });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.isLoggedIn = false;
  req.session.destroy((err) => {
    err ? sessionErrCb(err) : null;
    res.json({ isLoggedIn: false });
  });
});

// Roles
router.get("/allRoles", getAllRoles);

// Members
router.get("/allMembers", allMembers);
router.get('./getMember', getMember)
router.post("/setMember", setMember);
router.post("/deleteMember", deleteMember);
router.post("/updateMember", updateMember);

// Teams
router.get("/allTeams", allTeams);
router.post("/setTeam", setTeam);
router.post("/deleteTeam", deleteTeam);

app.use("/.netlify/functions/api", router);

// Startup local server if not production (prod is serverless)
if (!isProd) {
  app.listen(PORT, () => {
    console.log("IDOL backend listening on port: " + PORT);
  });
}

module.exports.handler = serverless(app);
