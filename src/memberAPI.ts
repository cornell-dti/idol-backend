import { checkLoggedIn } from './api';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Request, Response } from 'express';
import { Member } from './DataTypes';
import { ErrorResponse, MemberResponse, AllMembersResponse } from './APITypes';

export let allMembers = async function (req: Request, res: Response): Promise<AllMembersResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let allMembers: Member[] = await db.collection('members').get().then((vals) => {
      return vals.docs.map((doc) => doc.data()) as Member[];
    })
    return {
      status: 200,
      members: allMembers
    };
  }
};

export let setMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      return {
        status: 404,
        error: 'No member with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to edit members!'
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            status: 400,
            error: "Couldn't edit user with undefined email!"
          };
        }
        db.doc('members/' + req.body.email)
          .set(req.body)
          .then(() => {
            return {
              status: 200,
              member: req.body
            };
          })
          .catch((reason) => {
            return {
              status: 500,
              error: "Couldn't edit user for reason: " + reason
            };
          });
      }
    }
  }
};

export let updateMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      return {
        status: 404,
        error: 'No member with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit && member.email !== req.body.email) {
        // members are able to edit their own information
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to edit members!'
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            status: 400,
            error: "Couldn't edit user with undefined email!"
          };
        }
        if ((req.body.role || req.body.first_name || req.body.last_name) &&
          !canEdit) {
          return {
            status: 403,
            error: 'User with email: ' + req.session.email + ' does not have permission to edit member name or roles!',
          };
        }
        db.doc('members/' + req.body.email)
          .update(req.body)
          .then(() => {
            return {
              status: 200,
              member: req.body
            };
          })
          .catch((reason) => {
            return {
              status: 500,
              error: "Couldn't edit user for reason: " + reason
            };
          });
      }
    }
  }
};

export let getMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    console.log(member);
    if (!member) {
      return {
        status: 404,
        error: 'No member with email:' + req.session.email
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(member.role);
      let memberEmail: string = req.params.email;
      if (!canEdit && memberEmail !== req.session.email) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to get members!'
        };
      }
      let getmember: Member = (await db.doc('members/' + memberEmail).get()).data() as Member;
      return {
        status: 200,
        member: getmember
      };
    }
  }
};

export let deleteMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let member = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!member) {
      return {
        status: 404,
        error: 'No member with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(member.role);
      if (!canEdit) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to delete members!'
        };
      }
    }
  }
};
