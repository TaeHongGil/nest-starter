import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RedisService } from '@root/core/redis/redis.service';
import { createAdapter } from '@socket.io/redis-adapter';
import { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  constructor(private readonly app: NestExpressApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const redis = this.app.get(RedisService);
    const pubClient = redis.getGlobalClient();
    const subClient = pubClient.duplicate();

    const adapterConstructor = createAdapter(pubClient, subClient, options);

    const server = super.createIOServer(port, options);
    server.adapter(adapterConstructor);

    return server;
  }
}
