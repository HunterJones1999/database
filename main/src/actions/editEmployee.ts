import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.employee_id === undefined) {
            return 400;
        }

        let q = "";
        const subs: string[] = [];

        const addSetToQuery = (col: string, value: unknown, permission: boolean) => {
            if (!value || !permission) {
                return;
            }
            if (q === "") {
                q = `\`${col}\` = ?`
            } else {
                q += `, \`${col}\` = ?`
            }
            subs.push(value.toString());
        }
        
        addSetToQuery("name", json.name, req.user.priv.editEmployee.name);
        addSetToQuery("rank_id", json.rank_id, req.user.priv.editEmployee.rank);
        addSetToQuery("steamid", json.steamid, req.user.priv.editEmployee.steamId);
        addSetToQuery("profile_url", json.profile_url, req.user.priv.editEmployee.profileURL);
        addSetToQuery("access_blob", json.access_blob, req.user.priv.editEmployee.editPermissions);

        const result = await query(`UPDATE employee SET ${q} WHERE employee_id = ?`, ...subs, json.employee_id.toString());
        if (json.access_blob) {
            return await new Promise(resolve => {
                req.login(req.user, () => {
                    resolve(result.affectedRows > 0 ? 200 : 500);
                });
            });
        } else {
            return result.affectedRows > 0 ? 200 : 500;
        }
	},
	canRun: (user) => {
		return user.priv.editEmployee.base;
	}
	
}

export default action;