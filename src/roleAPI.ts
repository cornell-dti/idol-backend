import { Request, Response } from 'express';
import { checkLoggedIn } from './api';
import { allRoles } from './permissions';

export let getAllRoles = async (req: Request, res: Response) => {
  if (checkLoggedIn(req, res)) {
    res.status(200).json({ roles: allRoles });
  }
};
