import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { messageReducer } from './MessageReducer';
import { getMembers } from './GetMembers';

const app = express();
const router = express.Router();
const PORT = 3000;

app.use(bodyParser.json());

router.post('/message', async (req: Request, res: Response) => {
  const handled = await messageReducer(req, res);
  res.status(handled.status).json(handled);
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`NOVA server is listening on port ${PORT}`);
  getMembers();
});
