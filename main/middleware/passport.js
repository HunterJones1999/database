import passport from 'passport';
import Strategy from 'passport-steam';
import { query } from '../lib/db';
import SteamID from 'steamid';
import { getUserPriv } from '../lib/func';

passport.serializeUser(function(user, done) {
	getUserPriv(new SteamID(user._json.steamid).steam2()).then(priv => {
		const result = user;
		result.priv = priv;
		done(null, result);
	});
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new Strategy({
	returnURL: process.env.PUBLIC_URL + '/api/login',
	realm: process.env.PUBLIC_URL,
	apiKey: process.env.STEAMAPI_KEY ?? ""
	},
	function (identifier, profile, done) {
		process.nextTick(function () {
			profile.identifier = identifier;
			query("SELECT employee_id FROM employee WHERE steamid = ? LIMIT 1", new SteamID(profile._json.steamid).steam2()).then(result => {
				profile.employee_id = result[0].employee_id
				getUserPriv(new SteamID(profile._json.steamid).steam2()).then(priv => {
					profile.priv = priv;
					return done(null, profile);
				});
			});
		});
	}
));

export default passport;