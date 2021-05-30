import mysql from 'mysql';

export const db = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	database: process.env.MYSQL_DB,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
	port: parseInt(process.env.MYSQL_PORT),
	supportBigNumbers: true
});

export async function query(q: string, ...values: (string | number)[]): Promise<any> {
	try {
		return new Promise((resolve, reject) => {
			db.query(q, values, (error, results) => {
				if (error) {
					reject(error);
				}
				try {
					resolve(JSON.parse(JSON.stringify(results)));
				} catch (e) {
					console.log(e);
					console.log(results);
					resolve(null);
				}
			});
		});
	} catch (e) {
		throw Error(e.message)
	}
}