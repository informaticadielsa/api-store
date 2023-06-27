
const { Client } = require('pg');
const clientConexion = {
    user: 'postgres',
    host: 'localhost',
    database: 'punto_ecommerces',
    password: '123456',
    port: 5432,
};
module.exports = new Client(clientConexion)