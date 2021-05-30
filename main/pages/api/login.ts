import nextConnect from 'next-connect';
import { all } from '../../middleware/index';
import passport from '../../middleware/passport';

const handler = nextConnect();

handler.use(all);

handler.get(passport.authenticate('steam', { failureRedirect: '/api/login/', successRedirect: '/' }));

export default handler;