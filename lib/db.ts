import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function createUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
}

export async function createUser(username: string, email: string, password: string) {
  const result = await sql`
    INSERT INTO users (username, email, password)
    VALUES (${username}, ${email}, ${password})
    RETURNING id, username, email
  `;
  return result[0];
}

export async function getUserByUsername(username: string) {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username}
  `;
  return result[0];
}

export async function getUserByEmail(email: string) {
  const result = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;
  return result[0];
}