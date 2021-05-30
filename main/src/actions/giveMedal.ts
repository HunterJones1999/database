import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.medal_id === undefined || json.employee_id === undefined) {
            return 400;
        }

        const result = await query("INSERT INTO employee_medal (medal_id, employee_id) VALUES (?, ?)", json.medal_id.toString(), json.employee_id.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.editEmployee.giveMedal;
	}
	
}

export default action;