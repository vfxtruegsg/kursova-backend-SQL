import dotenv from 'dotenv';

dotenv.config();

export const getEnvVar = (name, defValue) => {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (defValue) {
    return defValue;
  }

  throw new Error(`Missing: process.env['${value}'].`);
};
