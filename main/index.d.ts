import * as expressSession from 'express-session'; 

declare global {
	declare namespace Horus {
		interface SteamUser {
			avatar: string;
			avatarfull: string;
			avatarhash: string;
			avatarmedium: string;
			communityvisibilitystate: number;
			lastlogoff: number;
			personaname: string;
			personastate: number;
			personastateflags: number;
			primaryclanid: number;
			profilestate: number;
			profileurl: string;
			realname: string;
			steamid: string;
			timecreated: number;
		}
		
		interface SessionUser {
			_json: SteamUser;
			displayName: string;
			employee_id: number;
			priv: UserPrivileges;
			id: number;
			identifier: string;
			photos: Record<string, unknown>[];
			provider: string;
		}

		interface UserPrivileges {
			createEmployee: boolean = false;
			editEmployee: {
				base: boolean = false;
				name: boolean = false;
				steamId: boolean = false;
				rank: boolean = false;
				profileURL: boolean = false;
				giveQualification: boolean = false;
				takeQualification: boolean = false;
				giveMedal: boolean = false;
				takeMedal: boolean = false;
				editPermissions: boolean = false;
			};
			deleteEmployee: boolean = false;
			createRank: boolean = false;
			editRank: {
				base: boolean = false;
				name: boolean = false;
				color: boolean = false;
			};
			deleteRank: boolean = false;
			createQualification: boolean = false;
			editQualification: {
				base: boolean = false;
				name: boolean = false;
			};
			deleteQualification: boolean = false;
			createMedal: boolean = false;
			editMedal: {
				base: boolean = false;
				name: boolean = false;
				imageUrl: boolean = false;
			};
			deleteMedal: boolean = false;
		}
		
		type User = SteamUser & {
			priv: UserPrivileges,
			employee_id?: number
		}
		
		interface SessionContext {
			req: { session: expressSession.Session & { priv: UserPrivileges } & { employee_id: number }, user: SessionUser }
		}
	}
}