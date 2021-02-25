import { RequestHandler } from "express";
import { db } from "./firebase";
import { PermissionsManager } from "./permissions";
import { checkLoggedIn } from "./api";
import { firestore } from "firebase-admin";
import { materialize } from "./util";
import { Member, Team, DBTeam } from "./DataTypes";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from 'express';
import { ErrorResponse, TeamResponse, AllTeamsResponse } from './APITypes';

export let allTeams = async function (req: Request, res: Response): Promise<AllTeamsResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let teamRefs = await db.collection("teams").get();
    let resp = await Promise.all(
      teamRefs.docs.map((teamRef) => materialize(teamRef.data()))
    );
    return {
      status: 200,
      teams: resp
    };
  }
};

export let setTeam = async function (req: Request, res: Response): Promise<TeamResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let teamBody = req.body as Team;
    let member = await (
      await db.doc("members/" + req.session.email).get()
    ).data();
    let canEdit = PermissionsManager.canEditTeams(member.role);
    if (!canEdit) {
      return {
        status: 403,
        error: "User with email: " + req.session.email + " does not have permission to edit teams!",
      };
    } else {
      if (teamBody.leaders.length > 0 && !teamBody.leaders[0].email) {
        return {
          status: 400,
          error: "Malformed leaders on POST!"
        };
      }
      if (teamBody.members.length > 0 && !teamBody.members[0].email) {
        return {
          status: 400,
          error: "Malformed members on POST!"
        };
      }
      let teamRef: DBTeam = {
        uuid: teamBody.uuid ? teamBody.uuid : uuidv4(),
        name: teamBody.name,
        leaders: teamBody.leaders.map((leader) =>
          db.doc("members/" + leader.email)
        ),
        members: teamBody.members.map((mem) => db.doc("members/" + mem.email)),
      };
      let existRes = await Promise.all(
        teamRef.leaders
          .concat(teamRef.members)
          .map((ref) => ref.get().then((val) => val.exists))
      );
      if (existRes.findIndex((val) => val === false) != -1) {
        return {
          status: 404,
          error: "Couldn't create team from members that don't exist!"
        };
      } else {
        db.doc("teams/" + teamRef.uuid)
          .set(teamRef)
          .then(() => {
            return {
              status: 200,
              team: { ...teamBody, uuid: teamRef.uuid }
            };
          })
          .catch((reason) => {
            return {
              status: 500,
              error: "Couldn't edit team for reason: " + reason
            };
          });
      }
    }
  }
};

export let deleteTeam = async function (req: Request, res: Response): Promise<TeamResponse | ErrorResponse> {
  if (checkLoggedIn(req, res)) {
    let teamBody = req.body as Team;
    if (!teamBody.uuid || teamBody.uuid === "") {
      return {
        status: 400,
        error: "Couldn't delete team with undefined uuid!"
      };
    }
    let member = await (
      await db.doc("members/" + req.session.email).get()
    ).data() as any;
    let teamSnap = await await db.doc("teams/" + teamBody.uuid).get();
    if (!teamSnap.exists) {
      return {
        status: 404,
        error: "No team with uuid: " + teamBody.uuid
      };
    } else {
      let canEdit = PermissionsManager.canEditTeams(member.role);
      if (!canEdit) {
        return {
          status: 403,
          error: "User with email: " + req.session.email + " does not have permission to delete teams!"
        };
      } else {
        db.doc("teams/" + teamBody.uuid)
          .delete()
          .then(() => {
            return {
              status: 200,
              team: teamBody
            }
          })
          .catch((reason) => {
            return {
              status: 500,
              error: "Couldn't delete team for reason: " + reason
            };
          });
      }
    }
  }
};