import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.name === undefined || json.steamid === undefined || json.rank_id === undefined || json.profile_url === undefined || json.access_blob === undefined) {
            console.log(json);
            return 400;
        }
        const result = await query("INSERT INTO employee (`name`, steamid, rank_id, profile_url, access_blob) VALUES (?, ?, ?, ?, ?)", json.name.toString(), json.steamid.toString(), json.rank_id.toString(), json.profile_url.toString(), json.access_blob.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.createEmployee;
	}
	
}

export default action;