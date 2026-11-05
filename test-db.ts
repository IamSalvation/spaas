import 'dotenv/config';
import postgres from 'postgres';

async function main() {
    console.log('Connecting to SPAAS on Prisma Postgres...');
    const client = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

    try {
        const result = await client`SELECT version()`;
        console.log('✅ Connection successful!');
        console.log('Database version:', result[0].version);
    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await client.end();
    }
}

main();