import { Injectable } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import { OAuth2Client, TokenPayload } from 'google-auth-library';

@Injectable()
export class GoogleAccountService {
  private client = new OAuth2Client();

  async getGoogleAsync(credential: string): Promise<TokenPayload> {
    const ticket = await this.client.verifyIdToken({
      idToken: credential,
      audience: ServerConfig.platform.google.client_id,
    });
    const payload = ticket.getPayload();

    return payload;
  }
}
