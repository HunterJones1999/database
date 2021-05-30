import { Stream } from "../streams";

const stream: Stream = {
	ttl: 5,
	fallback: 0,
	getData: async (context) => { if (context.query.error === true) { throw Error("This isn't a real error, you can ignore it"); } else { return 1; } },
	getKey: (context) => { return context.query.key; },
	canCollect: (user) => { return user.collect; }
}

export default stream;