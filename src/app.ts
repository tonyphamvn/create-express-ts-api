import http from 'http';
import express, { Application } from 'express';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import passport from 'passport';
import RequestLogger from '@/shared/logger';
import { Environment } from '@config';
import indexRouter from '@/routes/index';
import { errorHandler } from '@/middlewares/errorHandler';
import requestValidationHandler from '@/shared/request-validation-handler';
import { configurePassport } from '@/libs/passport';
import { initSocket } from '@/libs/socket';

class App {
  private app: Application;
  public port: number;
  public apiPrefix = '/api/v1';

  constructor(appInit: { port: number; middlewares: any[] }) {
    this.app = express();
    this.port = appInit.port;
    this.assets();
    this.middlewares(appInit.middlewares);
    this.initPassport();
    this.initRoutes();
    this.handleError();
  }

  private assets() {
    if (process.env.NODE_ENV === Environment.Production) {
      this.app.use(compress());
      this.app.use(helmet());
    } else {
      this.app.use(cors());
    }
  }

  private middlewares(mws: any[]) {
    mws.forEach((mw) => {
      this.app.use(mw);
    });
  }

  private initPassport() {
    configurePassport(passport);
    this.app.use(passport.initialize());
  }

  private initRoutes() {
    this.app.use(this.apiPrefix, indexRouter);
  }

  private handleError() {
    if (process.env.NODE_ENV === Environment.Development) {
      this.app.use(RequestLogger());
    }
    this.app.use(requestValidationHandler);
    this.app.use(errorHandler);
  }

  public async listen() {
    const server = http.createServer(this.app);

    await initSocket(server);

    await new Promise<void>((resolve) => {
      server.listen(this.port, () => {
        if (process.env.NODE_ENV !== Environment.Production) {
          console.log('Server is listening at port', this.port);
        }
        resolve();
      });
    });
  }
}

export default App;
