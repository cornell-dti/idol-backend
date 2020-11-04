import { checkLoggedIn } from './api';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Request, Response } from 'express';

export type Member = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  graduation: string;
  major: string;
  double_major?: string; //optional
  minor?: string; //optional
  website?: string; //optional
  linkedin_link?: string; //optional
  github_link?: string; //optional
  hometown: string;
  about: string;
  subteam: string;
  other_subteams?: string[]; // optional
};

export let allMembers = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    res.json({
      members: await db
        .collection('members')
        .get()
        .then((vals) => {
          return vals.docs.map((doc) => {
            return doc.data();
          });
        }),
    });
  }
};

export let setMember = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      res
        .status(200)
        .json({ error: 'No member with email: ' + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(200).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      } else {
        if (!req.body.email || req.body.email === '') {
          res
            .status(200)
            .json({ error: "Couldn't edit user with undefined email!" });
          return;
        }
        db.doc('members/' + req.body.email)
          .set(req.body)
          .then(() => {
            res.status(200).json({ status: 'Success', member: req.body });
          })
          .catch((reason) => {
            res
              .status(200)
              .json({ error: "Couldn't edit user for reason: " + reason });
          });
      }
    }
  }
};

export let updateMember = async (req: Request, res: Response) => {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      res
        .status(200)
        .json({ error: 'No member with email: ' + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit && member.email !== req.body.email) {
        // members are able to edit their own information
        res.status(200).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      } else {
        if (!req.body.email || req.body.email === '') {
          res
            .status(200)
            .json({ error: "Couldn't edit user with undefined email!" });
          return;
        }
        if (
          (req.body.role || req.body.first_name || req.body.last_name) &&
          !canEdit
        ) {
          res.status(200).json({
            error:
              'User with email: ' +
              req.session.email +
              ' does not have permission to edit member name or roles!',
          });
        }
        db.doc('members/' + req.body.email)
          .update(req.body)
          .then(() => {
            res.status(200).json({ status: 'Success', member: req.body });
          })
          .catch((reason) => {
            res
              .status(200)
              .json({ error: "Couldn't edit user for reason: " + reason });
          });
      }
    }
  }
};

export let getMember = async (req: Request, res: Response) => {
  console.log(req.session.email);
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    console.log(member);
    if (!member) {
      res // TODO: change the response status code
        .status(200)
        .json({ error: 'No member with email:' + req.session.email });
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(member.role);
      let memberEmail: string = req.params.email;
      if (!canEdit && memberEmail !== req.session.email) {
        // TODO: change the response status code
        res.status(200).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      }
      res.status(200).json({
        member: await (await db.doc('members/' + memberEmail).get()).data(),
      });
    }
  }
};

export let deleteMember = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      res
        .status(200)
        .json({ error: 'No member with email: ' + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(200).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      }
    }
  }
};
