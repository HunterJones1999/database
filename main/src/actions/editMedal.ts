import { query } from "../../lib/db";
import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
        if (!req.body) {
            return 400;
        }
        const json = JSON.parse(req.body);
        if (!json || json.medal_id === undefined) {
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
        
        addSetToQuery("name", json.name, req.user.priv.editMedal.name);
        addSetToQuery("image_url", json.image_url, req.user.priv.editMedal.imageUrl);

        const result = await query(`UPDATE medal SET ${q} WHERE medal_id = ?`, ...subs, json.medal_id.toString());
        return result.affectedRows > 0 ? 200 : 500;
	},
	canRun: (user) => {
		return user.priv.editRank.base;
	}
	
}

export default action;