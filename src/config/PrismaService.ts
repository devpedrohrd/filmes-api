import { PrismaClient } from "@prisma/client";

export class PrismaService extends PrismaClient{
    constructor() {
        super({
        log: ['query', 'info', 'warn', 'error'],
        });
    }

    async clientConnect(){
        await this.$connect();
    }

} 