import nextConnect from 'next-connect';
import passport from './passport';
import session from './session';

const all = nextConnect();

all.use(session).use(passport.initialize()).use(passport.session());

export default all;