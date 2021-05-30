import nextConnect from 'next-connect';
import { all } from '../../middleware/index';

const handler = nextConnect();

handler.use(all);

handler.get(async (req: any, res: any) => {
	return res.json({ user: req.user });
});

export default handler;