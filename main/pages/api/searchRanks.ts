import nextConnect from 'next-connect';
import { all } from '../../middleware/index';
import { collectStreams, streamsToProps } from '../../src/streams';

const handler = nextConnect();

handler.use(all);

handler.get(async (req: any, res: any) => {
	const fakeContext = { req, res, query: null, resolvedUrl: null };
	res.status(200).json(streamsToProps(await collectStreams(fakeContext, req.user, ["ranks"])).ranks);
});

export default handler;