import { GetServerSidePropsContext } from 'next';
import { all } from '../middleware';
import { query } from './db';

export async function getUserPriv(steamid: string): Promise<string[]> {
	const result = await query("SELECT access_blob FROM employee WHERE steamid = ? LIMIT 1", steamid);
	return JSON.parse(result[0]["access_blob"]);
}

export async function getUser(context: GetServerSidePropsContext & Horus.SessionContext): Promise<{ user: Horus.User }> {
	try {
		await all.run(context.req, context.res);
	} catch (e) {
		// Do something here
	}

	if (context.req && context.req.user) {
		return {
			user: {
				...context.req.user._json,
				priv: context.req.user.priv,
				employee_id: context.req.user.employee_id
			}
		}
	}
	return null;
}

export async function getSteamUser(steamId64: string): Promise<{ player: Horus.SteamUser }> {
	const res = await fetch('http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + process.env.STEAMAPI_KEY + '&steamids=' + steamId64)
	const data = await res.json();

	if (data.response.players.length === 0) {
		return null;
	}

	return {
		player: { ...data.response.players[0], priv: await getUserPriv(steamId64) }
	}
	
}