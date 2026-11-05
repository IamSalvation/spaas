import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  const sql = postgres(process.env['DATABASE_URL']!, { ssl: 'require' });
  try {
    const res = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'identity'
    `;
    console.log('? Tables found in DB:', res.map((r: any) => r.table_name));
  } catch (error) {
    console.error('? DB Error:', error);
  } finally {
    await sql.end();
  }
}

main();
