import { checkLoggedIn } from './api';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Request, Response } from 'express';
import { ErrorResponse, MemberResponse, AllMembersResponse } from './APITypes';
import { Member } from './DataTypes';

export let allMembers = async (
  req: Request,
  res: Response
): Promise<AllMembersResponse | undefined> => {
  if (checkLoggedIn(req, res)) {
    let members: Member[] = await db
      .collection('members')
      .get()
      .then((vals) => {
        return vals.docs.map((doc) => doc.data()) as Member[];
      });
    return { members: members, status: 200 };
  }
};

export let setMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> => {
  if (checkLoggedIn(req, res)) {
    let user = (await db.doc('members/' + req.session!.email).get()).data();
    if (!user) {
      return {
        error: 'No user with email: ' + req.session!.email,
        status: 401,
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(user.role);
      if (!canEdit) {
        return {
          error:
            'User with email: ' +
            req.session!.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            error: "Couldn't edit member with undefined email!",
            status: 400,
          };
        }
        let response: ErrorResponse | MemberResponse = await db
          .doc('members/' + req.body.email)
          .set(req.body)
          .then(() => {
            return { status: 200, member: req.body };
          })
          .catch((reason) => {
            return {
              error: "Couldn't edit member for reason: " + reason,
              status: 500,
            };
          });
        return response;
      }
    }
  }
};

export let updateMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> => {
  if (checkLoggedIn(req, res)) {
    let user = (await db.doc('members/' + req.session!.email).get()).data();
    if (!user) {
      return {
        error: 'No user with email: ' + req.session!.email,
        status: 401,
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(user.role);
      if (!canEdit && user.email !== req.body.email) {
        return {
          error:
            'User with email: ' +
            req.session!.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            error: "Couldn't edit member with undefined email!",
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
              req.session!.email +
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
              error: "Couldn't edit member for reason: " + reason,
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
): Promise<MemberResponse | ErrorResponse | undefined> => {
  if (checkLoggedIn(req, res)) {
    let user = (await db.doc('members/' + req.session!.email).get()).data();
    if (!user) {
      return {
        error: 'No user with email: ' + req.session!.email,
        status: 401,
      };
    } else {
      let canEdit: boolean = PermissionsManager.canEditMembers(user.role);
      let memberEmail: string = req.params.email;
      if (!canEdit && memberEmail !== req.session!.email) {
        return {
          error:
            'User with email: ' +
            req.session!.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      }
      let member = (await db.doc('members/' + memberEmail).get()).data();
      if (!member) {
        return {
          status: 404,
          error: 'Member with email: ' + memberEmail + ' does not exist',
        };
      }
      return {
        member: member as Member,
        status: 200,
      };
    }
  }
};

export let deleteMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> => {
  if (checkLoggedIn(req, res)) {
    let user = await (
      await db.doc('members/' + req.session?.email).get()
    ).data();
    if (!user) {
      return {
        error: 'No user with email: ' + req.session?.email,
        status: 401,
      };
    } else {
      let canEdit = PermissionsManager.canEditMembers(user.role);
      if (!canEdit) {
        return {
          error:
            'User with email: ' +
            req.session?.email +
            ' does not have permission to edit members!',
          status: 403,
        };
      } else {
        if (!req.body.email || req.body.email === '') {
          return {
            error: "Couldn't delete member with undefined email!",
            status: 400,
          };
        }
        let response: MemberResponse | ErrorResponse = await db
          .doc('members/' + req.body.email)
          .delete()
          .then(() => {
            return {
              member: req.body,
              status: 200,
            };
          })
          .catch((reason) => {
            return {
              error: "Couldn't delete member for reason: " + reason,
              status: 500,
            };
          });
        return response;
      }
    }
  }
};
