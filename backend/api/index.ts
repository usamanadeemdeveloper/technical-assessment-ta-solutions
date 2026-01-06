import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';

import { createApp } from '../src/bootstrap';

let cachedServer: express.Express | null = null;

const getServer = async (): Promise<express.Express> => {
  if (!cachedServer) {
    const server = express();
    await createApp(server);
    cachedServer = server;
  }

  return cachedServer!;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const server = await getServer();
  return new Promise((resolve, reject) => {
    server(req as any, res as any, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
}
