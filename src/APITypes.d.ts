import { Member, Team } from "./DataTypes"

type APIResponse = { status: number }

// Errors
export type ErrorResponse = APIResponse & { error: String }

// Members
export type MemberResponse = APIResponse & { member: Member }
export type AllMembersResponse = APIResponse & { members: Member[] }

// Teams
export type TeamResponse = APIResponse & { team: Team }
export type AllTeamsResponse = APIResponse & { teams: Team[] }

// Message (Script)
export type ImageResponse = APIResponse & { image: any }