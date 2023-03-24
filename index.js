'user strict';
require('dotenv').config();
const server = require('./src/server');

const PORT = process.env.PORT;
const prisma = require('./src/models/index');


server.start(PORT, prisma);
