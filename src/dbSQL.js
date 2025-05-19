import { Pool } from 'pg';
import { getEnvVar } from './utils/getEnvVar.js';

export const pool = new Pool({
  user: getEnvVar('NAME_DB'),
  host: getEnvVar('HOST_DB'),
  database: getEnvVar('DATABASE'),
  password: getEnvVar('PASSWORD_DB'),
  port: getEnvVar('PORT_DB'),
});
