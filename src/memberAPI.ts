import { Request, Response } from 'express';
import { checkLoggedIn } from './api';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Member } from './DataTypes';
import { ErrorResponse, MemberResponse, AllMembersResponse } from './APITypes';

export const allMembers = async function (
  req: Request,
  res: Response
): Promise<AllMembersResponse | ErrorResponse | undefined> {
  if (checkLoggedIn(req, res)) {
    const members: Member[] = await db
      .collection('members')
      .get()
      .then((vals) => {
        return vals.docs.map((doc) => doc.data()) as Member[];
      });
    return {
      status: 200,
      members: members
    };
  }
};

export const setMember = async function (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> {
  if (checkLoggedIn(req, res)) {
    const user = await (
      await db.doc(`members/${req.session!.email}`).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: `No user with email: ${req.session!.email}`
      };
    }
    const canEdit = PermissionsManager.canEditMembers(user.role);
    if (!canEdit) {
      return {
        status: 403,
        error: `User with email: ${req.session!.email
          } does not have permission to edit members!`
      };
    }
    if (!req.body.email || req.body.email === '') {
      return {
        status: 400,
        error: "Couldn't edit member with undefined email!"
      };
    }
    const response: MemberResponse | ErrorResponse = await db
      .doc(`members/${req.body.email}`)
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
          error: `Couldn't edit member ${req.body.email} for reason: ${reason}`
        };
      });
    return response;
  }
};

export const updateMember = async function (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> {
  if (checkLoggedIn(req, res)) {
    const user = await (
      await db.doc(`members/${req.session!.email}`).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: `No user with email: ${req.session!.email}`
      };
    }
    const canEdit = PermissionsManager.canEditMembers(user.role);
    if (!canEdit && user.email !== req.body.email) {
      // members are able to edit their own information
      return {
        status: 403,
        error: `User with email: ${req.session!.email
          } does not have permission to edit members!`
      };
    }
    if (!req.body.email || req.body.email === '') {
      return {
        status: 400,
        error: "Couldn't edit member with undefined email!"
      };
    }
    if (
      (req.body.role || req.body.first_name || req.body.last_name) &&
      !canEdit
    ) {
      return {
        status: 403,
        error: `User with email: ${req.session!.email
          } does not have permission to edit member name or roles!`
      };
    }
    const member = await (
      await db.doc(`members/${req.body.email}`).get()
    ).data();
    if (!member) {
      return {
        status: 404,
        error: `No member with email ${req.body.email}`
      };
    }
    const response: MemberResponse | ErrorResponse = await db
      .doc(`members/${req.body.email}`)
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
          error: `Couldn't edit member ${req.body.email} for reason: ${reason}`
        };
      });
    return response;
  }
};

export const getMember = async function (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> {
  if (checkLoggedIn(req, res)) {
    const user = await (
      await db.doc(`members/${req.session!.email}`).get()
    ).data();
    console.log(user);
    if (!user) {
      return {
        status: 401,
        error: `No user with email:${req.session!.email}`
      };
    }
    const canEdit: boolean = PermissionsManager.canEditMembers(user.role);
    const memberEmail: string = req.params.email;
    if (!canEdit && memberEmail !== req.session!.email) {
      return {
        status: 403,
        error: `User with email: ${req.session!.email
          } does not have permission to get members!`
      };
    }
    const response: MemberResponse | ErrorResponse = await db
      .doc(`members/${req.params.email}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return {
            status: 200,
            member: doc.data() as Member
          };
        }

        return {
          status: 404,
          error: `No member with email: ${req.params.email}`
        };
      })
      .catch((reason) => {
        return {
          status: 500,
          error: `Couldn't get member ${req.params.email} for reason: ${reason}`
        };
      });
    return response;
  }
};

export const deleteMember = async function (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse | undefined> {
  if (checkLoggedIn(req, res)) {
    const user = await (
      await db.doc(`members/${req.session!.email}`).get()
    ).data();
    if (!user) {
      return {
        status: 401,
        error: `No user with email: ${req.session!.email}`
      };
    }
    const canEdit = PermissionsManager.canEditMembers(user.role);
    if (!canEdit) {
      return {
        status: 403,
        error: `User with email: ${req.session!.email} does not have permission to delete members!`
      };
    }
    if (!req.body.email || req.body.email === '') {
      return {
        status: 400,
        error: "Couldn't delete member with undefined email!"
      };
    }
    const response: MemberResponse | ErrorResponse = await db
      .doc(`members/${req.body.email}`)
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
          error: `Couldn't delete member for reason: ${reason}`
        };
      });
    return response;
  }
};
