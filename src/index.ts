import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import App from '@/app';

const app = new App({
  port: parseInt(process.env.PORT || '4000'),
  socketPort: parseInt(process.env.SOCKET_PORT),
  redisUri: process.env.REDIS_URI,
  redisPort: parseInt(process.env.REDIS_PORT),
  middleWares: [
    bodyParser.json(),
    cookieParser(),
    bodyParser.urlencoded({ extended: true, limit: '5m' }),
  ],
});

app.listen();
