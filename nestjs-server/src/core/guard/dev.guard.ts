import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';

@Injectable()
export class DevGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!ServerConfig.dev) {
      return false;
    }

    return true;
  }
}
