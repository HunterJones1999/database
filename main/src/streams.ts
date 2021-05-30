import streamCache from '../lib/cache';
import { GetServerSidePropsContext } from 'next';
import { readdirSync } from 'fs';

export interface Stream {
	ttl: number // How long the result will be cached for. Set to 0 to disable caching.
	fallback: any // What value to return when an error occurs (e.g Unable to connect to database, 500 status code from webserver)
	getData: (context: any) => Promise <any> // The function which is called when the server needs to pull from this stream. It is only ever run server side, so actions like database querys are ok.
	getKey: (context: any) => string // This function returns the key that will be used to cache the value returned from getData(). Return an empty string to use the stream id.
	canCollect: (user: any) => boolean // This function returns whether the supplied user is allowed to collect this stream.
}

export const url = "http://" + process.env.GMOD_WEBSERVER_HOST + ":" + process.env.GMOD_WEBSERVER_PORT + "/"

let streams: {
	[key: string]: Stream
} = {};

async function populateStreams(): Promise<{ [key: string]: Stream }[]> {
	const promises = [];
	const files = readdirSync("./src/streams/");
	for (const file of files) {
		promises.push(new Promise((resolve, reject) => {
			import(`./streams/${file}`).then(stream => {
				const result = { [file.replace(/\.ts|\.js/, "")]: stream.default }
				resolve(result);
			}).catch(err => {
				reject(err);
			});
		}));
	}
	return Promise.all<{ [key: string]: Stream }>(promises);
}

/**
 * This function can be called to collect data before page load.
 * @param context The current app context
 * @param user The user collecting this stream (if any)
 * @param toCollect A list of streams to collect
 */
export async function collectStreams(context: GetServerSidePropsContext, user: Horus.User, toCollect: string[]): Promise<Record<string, unknown>[]> {

	if (Object.keys(streams).length === 0) {
		const importedStreams = await populateStreams();
		for (const s of importedStreams) {
			// console.log(`Adding ${Object.keys(s)[0]} to streams`)
			streams = { ...streams, ...s }
		}
	}

	const result = [];
	for (let i = 0; i < toCollect.length; i++) {
		const collect = toCollect[i];
		const stream = streams[collect];
		if (!stream) {
			console.log("ERROR: Tried to access unknown stream " + collect);
			continue;
		}
		if (stream.canCollect(user) !== true) {
			continue;
		}
		if (stream.ttl === 0) {
			result.push(new Promise((resolve) => {
				stream.getData(context).then((value) => {
					resolve({key: collect, value})
				}).catch(e => {
					console.log("Something went wrong! Returning fallback", e);
					resolve({key: collect, value: stream.fallback})
				});
			}));
		} else {
			let cacheKey = stream.getKey(context);
			if (!cacheKey) {
				cacheKey = collect;
			}
			if (!streamCache.has(cacheKey)) {
				result.push(new Promise((resolve) => {
					stream.getData(context).then((value) => {
						streamCache.set(cacheKey, value, stream.ttl);
						resolve({key: collect, value})
					}).catch(e => {
						console.log("Something went wrong! Returning fallback", e);
						resolve({key: collect, value: stream.fallback});
					});
				}));
			} else {
				result.push(new Promise((resolve) => {
					resolve({key: collect, value: streamCache.get(cacheKey)});
				}));
			}
		}
	}
	return Promise.all<Record<string, unknown>>(result);
}

export function streamsToProps(streams: any[]): Record<string, unknown> {
	const res = {}
	for (let i = 0; i < streams.length; i++) {
		res[streams[i].key] = streams[i].value
	}
	return res;
}