import { checkLoggedIn } from './api';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Request, Response } from 'express';
import { ErrorResponse, MemberResponse } from './APITypes';
import { Member } from './DataTypes';

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
        .status(401)
        .json({ error: 'No member with email: ' + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(403).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      } else {
        if (!req.body.email || req.body.email === '') {
          res
            .status(400)
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
              .status(500)
              .json({ error: "Couldn't edit user for reason: " + reason });
          });
      }
    }
  }
};

export let updateMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse> => {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      return {
        error: 'No member with email: ' + req.session.email,
        status: 401,
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(member.role);
      if (!canEdit && member.email !== req.body.email) {
        return {
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            error: "Couldn't edit user with undefined email!",
            status: 400,
          };
        }
        if (
          (req.body.role || req.body.first_name || req.body.last_name) &&
          !canEdit
        ) {
          return {
            status: 403,
            error:
              'User with email: ' +
              req.session.email +
              ' does not have permission to edit member name or roles!',
          };
        }
        let response: ErrorResponse | MemberResponse = await db
          .doc('members/' + req.body.email)
          .update(req.body)
          .then(() => {
            return {
              member: req.body as Member,
              status: 200,
            };
          })
          .catch((reason) => {
            return {
              error: "Couldn't edit user for reason: " + reason,
              status: 500,
            };
          });

        return response;
      }
    }
  }
};

export let getMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse> => {
  console.log(req.session.email);
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      return {
        error: 'No member with email: ' + req.session.email,
        status: 401,
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(member.role);
      let memberEmail: string = req.params.email;
      if (!canEdit && memberEmail !== req.session.email) {
        return {
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      }

      return {
        member: (await (
          await db.doc('members' + memberEmail).get()
        ).data()) as Member,
        status: 200,
      };
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
        .status(401)
        .json({ error: 'No member with email: ' + req.session.email });
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        res.status(403).json({
          error:
            'User with email: ' +
            req.session.email +
            ' does not have permission to edit members!',
        });
      }
    }
  }
};
