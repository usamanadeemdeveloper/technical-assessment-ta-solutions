import express, { Request, Response } from 'express';
import type { Application } from 'express';

import { createApp } from '../src/bootstrap';

let cachedServer: Application | null = null;

const getServer = async (): Promise<Application> => {
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
  const fn = server as unknown as (req: Request, res: Response) => void;
  fn(req, res);
}
