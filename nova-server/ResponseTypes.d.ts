import { Member } from './DataTypes';

type ServerResponse = { status: number };

type MemberResponse = { member: Member } & ServerResponse;

type ImageResponse = { image: any } & ServerResponse;

type ErrorResponse = { error: string } & ServerResponse;

type MessageResponse = MemberResponse | ImageResponse | ErrorResponse;
