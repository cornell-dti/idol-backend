import { allRoles } from './permissions';

export let getAllRoles = async (req, res) => {
  res.status(200).json({ roles: allRoles });
};
