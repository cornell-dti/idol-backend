import { checkLoggedIn } from "./api";
import { db } from "./firebase";
import { PermissionsManager } from "./permissions";

export let allMembers = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    res.json({
      members: await db.collection('members').get().then((vals) => {
        return vals.docs.map(doc => {
          return doc.data();
        });
      })
    });
  }
}

export let setMember = async (req, res) => {
  if (checkLoggedIn(req, res)) {
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
  }
};

export let deleteMember = async (req, res) => {
  if (checkLoggedIn(req, res)) {
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
  }
};