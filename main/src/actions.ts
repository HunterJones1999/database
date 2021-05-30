import { readdirSync } from 'fs';
import { NextApiRequest } from 'next';

export interface Action {
	run: (req: NextApiRequest & Express.Request & { user: Horus.User }) => Promise<number>	// The function which is run when the action is called. Return status code.
	canRun: (user: Horus.User) => boolean  // This function should return whether this action can be run by this user.
}

let actions: {
	[key: string]: Action
} = {}

function populateActions(): Promise<{ [key: string]: Action }[]> {
	const promises = [];
	const files = readdirSync("./src/actions/");
	for (const file of files) {
		promises.push(new Promise((resolve, reject) => {
			import(`./actions/${file}`).then(action => {
				const result = { [file.replace(/\.ts|\.js/, "")]: action.default }
				resolve(result);
			}).catch(err => {
				reject(err);
			});
		}));
	}
	return Promise.all<{ [key: string]: Action }>(promises);
}

export async function getActionById(id: string): Promise<Action | null> {
	return (await getActions())[id];
}

export async function getActions(): Promise<{ [key: string]: Action }> {

	if (Object.keys(actions).length === 0) {
		const importedActions = await populateActions();
		for (const s of importedActions) {
			// console.log(`Adding ${Object.keys(s)[0]} to actions`)
			actions = { ...actions, ...s }
		}
	}

	return actions;
}