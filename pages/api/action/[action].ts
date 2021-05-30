import nextConnect from 'next-connect';
import { all } from '../../../middleware/index';
import { getActionById } from '../../../src/actions';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = nextConnect();

handler.use(all);

handler.get(async (req: NextApiRequest, res: NextApiResponse) => { return res.json({}); });

handler.post(async (req: NextApiRequest & Express.Request & { user: Horus.User }, res: NextApiResponse) => {
	const { action } = req.query;
	const targetAction = await getActionById(action.toString());
	if (targetAction === null) {
		return res.status(404).end();
	}
	if (targetAction.canRun(req.user)) {
		try {
			const result = await targetAction.run(req);
			return res.status(result).end();
		} catch (e) {
			console.error(e);
		}
	} else {
		return res.status(403).end();
	}
});

export default handler;