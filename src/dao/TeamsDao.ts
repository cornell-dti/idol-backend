import { Team, DBTeam, Member } from '../types/DataTypes';
import { db } from './../firebase';
import { materialize } from './../util';
import { v4 as uuidv4 } from 'uuid';
import { DBAllTeamsResult, DBTeamResult } from './../types/DBResultTypes';

export class TeamsDao {
  static async getAllTeams(): Promise<DBAllTeamsResult> {
    let teamRefs = await db.collection('teams').get();
    let teams = await Promise.all(
      teamRefs.docs.map((teamRef) => materialize(teamRef.data()))
    );
    return { isSuccessful: true, teams: teams };
  }

  static async setTeam(team: Team): Promise<DBTeamResult> {
    let teamRef: DBTeam = {
      uuid: team.uuid ? team.uuid : uuidv4(),
      name: team.name,
      leaders: team.leaders.map((leader) => db.doc(`members/${leader.email}`)),
      members: team.members.map((mem) => db.doc(`members/${mem.email}`)),
    };
    let existRes = await Promise.all(
      teamRef.leaders
        .concat(teamRef.members)
        .map((ref) => ref.get().then((val) => val.exists))
    );
    if (existRes.findIndex((val) => val === false) != -1) {
      return {
        isSuccessful: false,
        error: "Couldn't create team from members that don't exist!",
        team: team,
      };
    }
    let result = db
      .doc(`teams/${teamRef.uuid}`)
      .set(teamRef)
      .then(() => {
        return {
          isSuccessful: true,
          team: { ...team, uuid: teamRef.uuid },
        };
      })
      .catch((reason) => {
        return {
          isSuccessful: false,
          error: `Couldn't edit team for reason: ${reason}`,
          team: { ...team, uuid: teamRef.uuid },
        };
      });
    return result;
  }

  static async deleteTeam(teamUuid: string): Promise<DBTeamResult> {
    let result = db
      .doc(`teams/${teamUuid}`)
      .delete()
      .then(() => {
        return {
          isSuccessful: true,
          team: null,
        };
      })
      .catch((reason) => {
        return {
          isSuccessful: false,
          error: `Couldn't delete team for reason: ${reason}`,
          team: null,
        };
      });
    return result;
  }
}
