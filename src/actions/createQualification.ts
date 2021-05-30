import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.name === undefined) {
            return 400;
        }
        const result = await query("INSERT INTO qualification (`name`) VALUES (?)", json.name.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.createQualification;
	}
	
}

export default action;