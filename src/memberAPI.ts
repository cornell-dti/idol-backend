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
    let user = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: 'No user with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(user.role);
      if (!canEdit) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to edit members!'
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            status: 400,
            error: "Couldn't edit member with undefined email!"
          };
        }
        let response: MemberResponse | ErrorResponse = await db.doc('members/' + req.body.email)
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
              error: "Couldn't edit member " + req.body.email + " for reason: " + reason
            };
          });
        return response;
      }
    }
  }
};

export let updateMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let user = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: 'No user with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(user.role);
      if (!canEdit && user.email !== req.body.email) {
        // members are able to edit their own information
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to edit members!'
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            status: 400,
            error: "Couldn't edit member with undefined email!"
          };
        }
        if ((req.body.role || req.body.first_name || req.body.last_name) &&
          !canEdit) {
          return {
            status: 403,
            error: 'User with email: ' + req.session.email + ' does not have permission to edit member name or roles!',
          };
        }
        let member = await (await db.doc('members/' + req.body.email).get()).data()
        if (!member) {
          return {
            status: 404,
            error: "No member with email " + req.body.email
          }
        }
        let response: MemberResponse | ErrorResponse = await db.doc('members/' + req.body.email)
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
              error: "Couldn't edit member " + req.body.email + " for reason: " + reason
            };
          });
        return response;
      }
    }
  }
};

export let getMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let user = await (await db.doc('members/' + req.session.email).get()).data();
    console.log(user);
    if (!user) {
      return {
        status: 401,
        error: 'No user with email:' + req.session.email
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(user.role);
      let memberEmail: string = req.params.email;
      if (!canEdit && memberEmail !== req.session.email) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to get members!'
        };
      }
      let response: MemberResponse | ErrorResponse = await db.doc('members/' + req.params.email)
        .get()
        .then((doc) => {
          if (doc.exists) {
            return {
              status: 200,
              member: doc.data() as Member
            };
          }
          else {
            return {
              status: 404,
              error: 'No member with email: ' + req.params.email
            };
          }
        })
        .catch((reason) => {
          return {
            status: 500,
            error: "Couldn't get member " + req.params.email + " for reason: " + reason
          };
        });
      return response;
    }
  }
};

export let deleteMember = async function (req: Request, res: Response): Promise<MemberResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let user = await (
      await db.doc('members/' + req.session.email).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: 'No user with email: ' + req.session.email
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(user.role);
      if (!canEdit) {
        return {
          status: 403,
          error: 'User with email: ' + req.session.email + ' does not have permission to delete members!'
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            status: 400,
            error: "Couldn't delete member with undefined email!"
          };
        }
        let response: MemberResponse | ErrorResponse = await db.doc('members/' + req.body.email)
          .delete()
          .then(() => {
            return {
              status: 200,
              member: req.body
            };
          })
          .catch((reason) => {
            return {
              status: 500,
              error: "Couldn't delete member for reason: " + reason
            };
          });
        return response;
      }
    }
  }
}
