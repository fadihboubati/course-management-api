'use strict';
const { PrismaClient } = require('@prisma/client');


//  use a Singleton pattern to share the instance of PrismaClient class,
// it guarantees that a class has only one instance while providing a global access point to this instance.
class Prisma {
    constructor() {
        if (!Prisma.instance) {
            Prisma.instance = new PrismaClient();
        }
    }

    getInstance() {
        return Prisma.instance;
    }
}

const prisma = new Prisma();
module.exports = prisma.getInstance();


// const Collections = require("./lib/collections");
// const prismaCollection = new Collections(prisma.getInstance());
// module.exports = prismaCollection;


