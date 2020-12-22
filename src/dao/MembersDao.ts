import { Member } from '../types/DataTypes';
import { DBAllMembersResult, DBMemberResult } from './../types/DBResultTypes';
import { db } from './../firebase';

export class MembersDao {
  static async getAllMembers(): Promise<DBAllMembersResult> {
    let members: Member[] = await db
      .collection('members')
      .get()
      .then((vals) => {
        return vals.docs.map((doc) => doc.data()) as Member[];
      });
    return { members: members, isSuccessful: true };
  }

  static async getMember(email: string): Promise<DBMemberResult> {
    let member = (await (
      await db.doc(`members/${email}`).get()
    ).data()) as Member;
    return { member: member, isSuccessful: true };
  }

  static async deleteMember(email: string): Promise<DBMemberResult> {
    let result = await db
      .doc(`members/${email}`)
      .delete()
      .then(() => {
        return { isSuccessful: true, member: null };
      })
      .catch((reason) => {
        return {
          isSuccessful: false,
          error: `Unable to to delete member for reason: ${reason}`,
          member: null,
        };
      });
    return result;
  }

  static async setMember(
    email: string,
    member: Member
  ): Promise<DBMemberResult> {
    let result = await db
      .doc(`members/${email}`)
      .set(member)
      .then(() => {
        return { isSuccessful: true, member: member };
      })
      .catch((reason) => {
        return {
          isSuccessful: false,
          error: `Unable to edit member for reason: ${reason}`,
          member: member,
        };
      });
    return result;
  }

  static async updateMember(
    email: string,
    member: Member
  ): Promise<DBMemberResult> {
    let result = await db
      .doc(`members/${email}`)
      .update(member)
      .then(() => {
        return { isSuccessful: true, member: member };
      })
      .catch((reason) => {
        return {
          isSuccessful: false,
          error: `Unable to edit member for reason: ${reason}`,
          member: member,
        };
      });
    return result;
  }
}
