import { checkLoggedIn } from "./api";
import { allRoles } from "./permissions";

export let getAllRoles = async (req, res) => {
  if (checkLoggedIn(req, res)) {
    res.status(200).json({ roles: allRoles });
  }
};