import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.name === undefined || json.image_url === undefined) {
            return 400;
        }
        const result = await query("INSERT INTO medal (`name`, image_url) VALUES (?, ?)", json.name.toString(), json.image_url.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.createMedal;
	}
	
}

export default action;