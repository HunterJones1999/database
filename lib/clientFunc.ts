export function timeLength(seconds: number): string {

	const w = Math.floor(seconds / (3600*24*7));
	const d = Math.floor(seconds % (3600*24*7) / (3600*24));
	const h = Math.floor(seconds % (3600*24) / 3600);
	const m = Math.floor(seconds % 3600 / 60);

	return ((w) ? (w + "w") : "") + ((d) ? (((w) ? " " : "") + d + "d") : "") + ((h) ? (((d) ? " " : "") + h + "h") : "") + ((m) ? (((h) ? " " : "") + m + "m") : "");
}