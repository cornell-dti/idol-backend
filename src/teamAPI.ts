import { RequestHandler } from 'express';
import { firestore } from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { PermissionsManager } from './permissions';
import { checkLoggedIn } from './api';
import { materialize } from './util';
import { Member, DBTeam, Team } from './DataTypes';

export const allTeams = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    const teamRefs = await db.collection('teams').get();
    const resp = await Promise.all(
      teamRefs.docs.map((teamRef) => materialize(teamRef.data()))
    );
    res.json({ teams: resp });
  }
};

export const setTeam = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    const teamBody = req.body as Team;
    const member = (await (
      await db.doc(`members/${req.session.email}`).get()
    ).data()) as Member;
    const canEdit = PermissionsManager.canEditTeams(member.role);
    if (!canEdit) {
      res.status(200).json({
        error: `User with email: ${req.session.email} does not have permission to edit teams!`
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
      const teamRef: DBTeam = {
        uuid: teamBody.uuid ? teamBody.uuid : uuidv4(),
        name: teamBody.name,
        leaders: teamBody.leaders.map((leader) =>
          db.doc(`members/${leader.email}`)
        ),
        members: teamBody.members.map((mem) => db.doc(`members/${mem.email}`))
      };
      const existRes = await Promise.all(
        teamRef.leaders
          .concat(teamRef.members)
          .map((ref) => ref.get().then((val) => val.exists))
      );
      if (existRes.findIndex((val) => val === false) != -1) {
        res.status(200).json({
          error: "Couldn't create team from members that don't exist!"
        });
      } else {
        db.doc(`teams/${teamRef.uuid}`)
          .set(teamRef)
          .then(() => {
            res.status(200).json({
              status: 'Success',
              team: { ...teamBody, uuid: teamRef.uuid }
            });
          })
          .catch((reason) => {
            res
              .status(200)
              .json({ error: `Couldn't edit team for reason: ${reason}` });
          });
      }
    }
  }
};

export const deleteTeam = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    const teamBody = req.body as Team;
    if (!teamBody.uuid || teamBody.uuid === '') {
      res
        .status(200)
        .json({ error: "Couldn't delete team with undefined uuid!" });
      return;
    }
    const member = (await (
      await db.doc(`members/${req.session.email}`).get()
    ).data()) as Member;
    const teamSnap = await await db.doc(`teams/${teamBody.uuid}`).get();
    if (!teamSnap.exists) {
      res.status(200).json({ error: `No team with uuid: ${teamBody.uuid}` });
    } else {
      const canEdit = PermissionsManager.canEditTeams(member.role);
      if (!canEdit) {
        res.status(200).json({
          error: `User with email: ${req.session.email} does not have permission to delete teams!`
        });
      } else {
        db.doc(`teams/${teamBody.uuid}`)
          .delete()
          .then(() => {
            res.status(200).json({ status: 'Success', team: teamBody });
          })
          .catch((reason) => {
            res
              .status(200)
              .json({ error: `Couldn't delete team for reason: ${reason}` });
          });
      }
    }
  }
};
