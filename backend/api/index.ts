import express, { Request, Response } from 'express';

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
  req: Request,
  res: Response,
): Promise<void> {
  const server = await getServer();
  server(req, res);
}
