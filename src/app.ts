import express, { Application } from 'express';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import RequestLogger from '@/helpers/logger';
import { Environment } from '@config';
import indexRouter from '@/routes/index';
import { errorHandler } from '@/middlewares/errorHandler';
import requestValidationHandler from '@/helpers/requestValidationHandler';
import SocketServer from '@/libs/socket';

class App {
  private app: Application;
  public port: number;
  public apiPrefix = '/api/v1';

  constructor(appInit: {
    port: number;
    socketPort: number;
    redisUri: string;
    redisPort: number;
    middleWares: any;
  }) {
    this.app = express();
    this.port = appInit.port;
    this.assets();
    this.middleWares(appInit.middleWares);
    // this.connectSocket(appInit.socketPort, appInit.redisUri, appInit.redisPort);
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

  private middleWares(middleWares: { forEach: (arg0: (middleWare: any) => void) => void }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }

  private initRoutes() {
    this.app.use(this.apiPrefix, indexRouter);
  }

  private handleError() {
    // Handle common errors
    if (process.env.NODE_ENV === Environment.Development) {
      this.app.use(RequestLogger());
    }
    this.app.use(requestValidationHandler);
    this.app.use(errorHandler);
  }

  public listen() {
    this.app.listen(this.port, () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Server is listening at port', this.port);
      }
    });
  }

  private connectSocket(port: number, redisUri: string, redisPort: number) {
    new SocketServer(port, redisUri, redisPort).createServer();
  }
}

export default App;
