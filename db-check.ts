import 'dotenv/config';
import postgres from 'postgres';

async function check() {
  console.log('Waking up Prisma Postgres...');
  const sql = postgres(process.env['DATABASE_URL']!, { ssl: 'require', idle_timeout: 5 });
  
  try {
    const res = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'identity'`;
    console.log('? Tables found in DB:', res.map((r: any) => r.table_name));
  } catch (err) {
    console.error('? Error:', err);
  } finally {
    await sql.end();
  }
}

check();
