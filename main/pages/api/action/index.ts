import { getActions } from '../../../src/actions';
import nextConnect from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = nextConnect();

handler.get(async (req: NextApiRequest, res: NextApiResponse) => { return res.json(await getActions()); });

export default handler;