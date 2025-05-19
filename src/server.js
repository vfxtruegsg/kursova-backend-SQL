import express from 'express';
import cors from 'cors';
import router from './routers/index.js';

import { getEnvVar } from './utils/getEnvVar.js';

const PORT = Number(getEnvVar('PORT', 3000));

export const startServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(router);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
