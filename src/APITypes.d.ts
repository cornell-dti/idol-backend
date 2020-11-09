import { Member } from './DataTypes';

type ErrorResponse = {
  error: string;
  status: number;
};

type MemberResponse = {
  status: number;
  member: Member;
};
