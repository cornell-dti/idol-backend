import { MembersDao } from './dao/MembersDao';
import { PermissionsManager } from './permissions';
import { Request, Response } from 'express';
import {
  ErrorResponse,
  MemberResponse,
  AllMembersResponse,
} from './types/APITypes';
import { Member } from './types/DataTypes';

export let allMembers = async (
  req: Request,
  res: Response
): Promise<AllMembersResponse> => {
  let result = await MembersDao.getAllMembers();
  return { members: result.members, status: 200 };
};

export let setMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse> => {
  let user = req.res.locals.user;
  let canEdit = PermissionsManager.canEditMembers(user.role);
  if (!canEdit) {
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
        error: "Couldn't edit member with undefined email!",
        status: 400,
      };
    }
    let result = await MembersDao.setMember(req.body.email, req.body);
    if (result.isSuccessful) {
      return { status: 200, member: result.member };
    } else {
      return {
        error: result.error,
        status: 500,
      };
    }
  }
};

export let updateMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse> => {
  let user = req.res.locals.user;
  let canEdit: boolean = PermissionsManager.canEditMembers(user.role);
  if (!canEdit && user.email !== req.body.email) {
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
          req.session.email +
          ' does not have permission to edit member name or roles!',
      };
    }
    let result = await MembersDao.updateMember(req.body.email, req.body);
    if (result.isSuccessful) {
      return { member: result.member, status: 200 };
    } else {
      return {
        status: 500,
        error: result.error,
      };
    }
  }
};

export let getMember = async (
  req: Request,
  res: Response
): Promise<MemberResponse | ErrorResponse> => {
  let user = req.res.locals.user;
  let canEdit: boolean = PermissionsManager.canEditMembers(user.role);
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
  let result = await MembersDao.getMember(memberEmail);
  if (!result.member) {
    return {
      status: 404,
      error: 'Member with email: ' + memberEmail + ' does not exist',
    };
  }
  return {
    member: result.member as Member,
    status: 200,
  };
};

export let deleteMember = async (
  req,
  res
): Promise<MemberResponse | ErrorResponse> => {
  let user = req.res.locals.user;
  let canEdit = PermissionsManager.canEditMembers(user.role);
  if (!canEdit) {
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
        error: "Couldn't delete member with undefined email!",
        status: 400,
      };
    }
    let result = await MembersDao.deleteMember(req.body.email);
    if (result.isSuccessful) {
      return { member: result.member, status: 200 };
    } else {
      return {
        status: 500,
        error: result.error,
      };
    }
  }
};
