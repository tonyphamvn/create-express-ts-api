import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Environment } from '@config';

let io: Server | null = null;

function buildRedisUrl(): string {
  const base = (process.env.REDIS_URI || 'redis://localhost').replace(/\/$/, '');
  const port = process.env.REDIS_PORT || '6379';
  const password = process.env.REDIS_PASSWORD;

  const url = new URL(base.includes('://') ? base : `redis://${base}`);
  if (!url.port) {
    url.port = port;
  }
  if (password) {
    url.password = password;
  }

  return url.toString();
}

function registerHandlers(server: Server) {
  server.on('connection', (socket: Socket) => {
    if (process.env.NODE_ENV !== Environment.Production) {
      console.log(`Socket connected: ${socket.id}`);
    }

    // Register domain events here, e.g. socket.on('chat:message', ...)

    socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV !== Environment.Production) {
        console.log(`Socket disconnected: ${socket.id} (${reason})`);
      }
    });
  });
}

/**
 * Attach Socket.IO to the shared HTTP server and enable the Redis adapter
 * so emits work across multiple Node processes.
 */
export async function initSocket(httpServer: HttpServer): Promise<Server> {
  if (io) {
    return io;
  }

  const pubClient = createClient({ url: buildRedisUrl() });
  const subClient = pubClient.duplicate();

  pubClient.on('error', (error) => {
    console.error('Redis pub client error', error);
  });
  subClient.on('error', (error) => {
    console.error('Redis sub client error', error);
  });

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === Environment.Production ? false : '*',
      methods: ['GET', 'POST'],
    },
    adapter: createAdapter(pubClient, subClient),
  });

  registerHandlers(io);

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO has not been initialized. Call initSocket() first.');
  }

  return io;
}
