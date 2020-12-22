import { firestore } from 'firebase-admin';

type role = 'lead' | 'admin' | 'tpm' | 'pm' | 'developer' | 'designer';

type Member = {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  graduation: string;
  major: string;
  double_major?: string; //optional
  minor?: string; //optional
  website?: string; //optional
  linkedin_link?: string; //optional
  github_link?: string; //optional
  hometown: string;
  about: string;
  subteam: string;
  other_subteams?: string[]; // optional
};

type DBTeam = {
  uuid: string;
  name: string;
  leaders: firestore.DocumentReference[];
  members: firestore.DocumentReference[];
};

type Team = {
  uuid: string;
  name: string;
  leaders: Member[];
  members: Member[];
};
