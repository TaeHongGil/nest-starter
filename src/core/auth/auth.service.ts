/**
 * Redis Service
 */

import { Injectable } from '@nestjs/common';
import { SessionData } from 'express-session';
import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async getSessionAsync(id: string): Promise<SessionData> {
    return await this.authRepository.getSessionAsync(id);
  }
}
