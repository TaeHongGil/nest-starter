import { CanActivate, ExecutionContext } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import * as crypto from 'crypto';

export class SlackGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const slackSignature = request.headers['x-slack-signature'] as string;
    const slackTimestamp = request.headers['x-slack-request-timestamp'] as string;
    const signingSecret = ServerConfig.platform.slack.signing_secret;

    const time = Math.floor(Date.now() / 1000);
    if (Math.abs(time - parseInt(slackTimestamp, 10)) > 300) {
      console.error('Invalid timestamp');

      return false;
    }

    const body = request.rawBody || '';
    const sigBaseString = `v0:${slackTimestamp}:${body}`;

    const hmac = crypto.createHmac('sha256', signingSecret);
    const mySignature = `v0=${hmac.update(sigBaseString).digest('hex')}`;

    if (!crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(slackSignature))) {
      console.error('Invalid signature');

      return false;
    }

    return true;
  }
}
