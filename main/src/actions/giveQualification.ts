import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.qualification_id === undefined || json.receiver_id === undefined || json.entry_date === undefined || !req.user.employee_id) {
            return 400;
        }

        const result = await query("INSERT INTO employee_qualification (qualification_id, receiver_id, trainer_id, entry_date) VALUES (?, ?, ?, FROM_UNIXTIME(?))", json.qualification_id.toString(), json.receiver_id.toString(), req.user.employee_id, json.entry_date.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.editEmployee.giveQualification;
	}
	
}

export default action;