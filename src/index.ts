import 'reflect-metadata';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import App from '@/app';
import { initializeDatabase } from '@/libs/mikro-orm';

async function bootstrap() {
  await initializeDatabase();

  const app = new App({
    port: parseInt(process.env.PORT || '4000', 10),
    middlewares: [
      bodyParser.json(),
      cookieParser(),
      bodyParser.urlencoded({ extended: true, limit: '5m' }),
    ],
  });

  await app.listen();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
