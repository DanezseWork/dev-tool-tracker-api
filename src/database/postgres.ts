import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();

function withConnectTimeout(url: string): string {
  if (/[?&]connect_timeout=/.test(url)) return url;
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}connect_timeout=15`;
}

export function runtimeDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return withConnectTimeout(url);
}

export function migrationDatabaseUrl(): string {
  const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL_UNPOOLED is not set');
  }
  return withConnectTimeout(url);
}

export function postgresSsl(
  url: string,
): false | { rejectUnauthorized: false } {
  const needsSsl =
    process.env.NODE_ENV === 'production' ||
    url.includes('sslmode=require') ||
    url.includes('.neon.tech');
  return needsSsl ? { rejectUnauthorized: false } : false;
}
