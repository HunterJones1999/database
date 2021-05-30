import nextConnect from 'next-connect';
import { all } from '../../middleware/index';

const handler = nextConnect();

handler.use(all);

handler.get((req: any, res: any) => {
	req.logout();
	req.session.destroy();
	res.redirect("/")
});

export default handler;