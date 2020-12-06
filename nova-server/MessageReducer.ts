import { Request, Response } from 'express';
import { Member } from './DataTypes';
import { getNetId } from './utils';
import {
  MessageResponse,
  ErrorResponse,
  MemberResponse,
  ImageResponse,
} from './ResponseTypes';

const fs = require('fs');
const dirPath: string = 'nova-server/members/';

export let messageReducer = async (
  req: Request,
  res: Response
): Promise<MessageResponse> => {
  console.log(req.body);
  let response;
  if (req.body.member) response = await updateMemberInfo(req.body.member);
  else if (req.body.image) response = await updateMemberImage(req.body.image);
  return response;
};

let updateMemberInfo = async (
  member: Member
): Promise<MemberResponse | ErrorResponse> => {
  console.log(member);
  let netId: string = getNetId(member.email);
  let data = JSON.stringify(member);

  let response;
  try {
    fs.writeFileSync(dirPath + `${netId}.json`, data);
    response = { status: 200, member: member };
  } catch {
    response = {
      status: 500,
      error: `The server was unable to update member with NetID ${netId}`,
    };
  }
  return response;
};

let updateMemberImage = async (
  image
): Promise<ImageResponse | ErrorResponse> => {
  return {
    status: 500,
    error: 'Unimplemented',
  };
};
