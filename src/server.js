import express from 'express';
import cors from 'cors';

import { Pool } from 'pg';
import { getEnvVar } from './utils/getEnvVar.js';

export const startServer = () => {
  const app = express();

  app.use(cors());
};
