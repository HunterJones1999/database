import { Action } from "../actions";

const action: Action = {
	run: async (req) => {
		console.log("Ban player " + req);
		fetch("banPlayer", { method: "POST" })
		return 200;
	},
	canRun: () => {
		return true;
	}
	
}

export default action;