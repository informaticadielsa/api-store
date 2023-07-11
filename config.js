import env from 'dotenv';
import path from 'path';

console.log('PROCS', '\nDOTENV', __dirname);
env.config();
console.log('PROCES', process.env.NODE_ENV);
module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '127.0.0.1',
  PORT: process.env.PORT || 3000,
  POSTGRESQL: process.env.POSTGRESQL || 'postgres://postgres:23JuLio90@localhost:5432/punto_commerce'
}
