import { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { db } from '../lib/db';

const store = new (MySQLStore({ ...session, default: null }))({ createDatabaseTable: true }, db);

const sess = session({
	secret: process.env.SESSION_SECRET ?? "",
	resave: false,
	saveUninitialized: false,
	store
});

export default function sessionMiddlware(req: Request, res: Response, next: NextFunction): void {
	return sess(req, res, next);
}