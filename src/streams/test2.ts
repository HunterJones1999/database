import { Stream } from "../streams";

const stream: Stream = {
	ttl: 0,
	fallback: 0,
	getData: async () => { return 1; },
	getKey: () => { return ""; },
	canCollect: () => { return true; }
}

export default stream;