import { Request, Response } from 'express';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { Team } from './types/DataTypes';
import { TeamsDao } from './dao/TeamsDao';
import {
  ErrorResponse,
  TeamResponse,
  AllTeamsResponse,
} from './types/APITypes';

export let allTeams = async (
  req: Request,
  res: Response
): Promise<AllTeamsResponse | ErrorResponse> => {
  let result = await TeamsDao.getAllTeams();
  return {
    status: 200,
    teams: result.teams,
  };
};

export let setTeam = async (
  req: Request,
  res: Response
): Promise<ErrorResponse | TeamResponse> => {
  let teamBody = req.body as Team;
  let member = req.res.locals.user;
  let canEdit = PermissionsManager.canEditTeams(member.role);
  if (!canEdit) {
    res.status(200).json({
      error:
        'User with email: ' +
        req.session.email +
        ' does not have permission to edit teams!',
    });
  } else {
    if (teamBody.leaders.length > 0 && !teamBody.leaders[0].email) {
      res.status(200).json({ error: 'Malformed leaders on POST!' });
      return;
    }
    if (teamBody.members.length > 0 && !teamBody.members[0].email) {
      res.status(200).json({ error: 'Malformed members on POST!' });
      return;
    }
    let result = await TeamsDao.setTeam(teamBody);
    if (result.isSuccessful) {
      return {
        status: 200,
        team: result.team,
      };
    } else {
      return {
        status: 500,
        error: result.error,
      };
    }
  }
};

export let deleteTeam = async (
  req: Request,
  res: Response
): Promise<TeamResponse | ErrorResponse> => {
  let teamBody = req.body as Team;
  if (!teamBody.uuid || teamBody.uuid === '') {
    res
      .status(200)
      .json({ error: "Couldn't delete team with undefined uuid!" });
    return;
  }
  let member = req.res.locals.user;
  let teamSnap = await await db.doc('teams/' + teamBody.uuid).get();
  if (!teamSnap.exists) {
    res.status(200).json({ error: 'No team with uuid: ' + teamBody.uuid });
  } else {
    let canEdit = PermissionsManager.canEditTeams(member.role);
    if (!canEdit) {
      res.status(200).json({
        error:
          'User with email: ' +
          req.session.email +
          ' does not have permission to delete teams!',
      });
    } else {
      let result = await TeamsDao.deleteTeam(teamBody.uuid);
      if (result.isSuccessful) {
        return {
          status: 200,
          team: teamBody,
        };
      } else {
        return {
          status: 500,
          error: result.error,
        };
      }
    }
  }
};
