import { Injectable } from '@nestjs/common';
import { SessionUser } from '@root/core/auth/auth.schema';
import { CoreDefine, PLATFORM } from '@root/core/define/define';
import { ServerError } from '@root/core/error/server.error';
import { HttpUtil } from '@root/core/utils/http.utils';
import { SessionData } from 'express-session';
import { OAuth2Client } from 'google-auth-library';
import { AccountRepository } from './account.repository';
import { DBAccount } from './account.schema';
import { AccountService } from './account.service';
const client = new OAuth2Client();

@Injectable()
export class AccountPlatformService {
  private readonly platformIdFetchers: Record<PLATFORM, (token: string) => Promise<string>>;

  constructor(
    private readonly accountService: AccountService,
    private readonly repository: AccountRepository,
  ) {
    this.platformIdFetchers = {
      [PLATFORM.SERVER]: async (): Promise<string> => undefined,
      [PLATFORM.GOOGLE]: this.getGoogleAsync.bind(this),
      [PLATFORM.NAVER]: this.getNaverIdAsync.bind(this),
      [PLATFORM.KAKAO]: this.getKakaoIdAsync.bind(this),
    };
  }

  async getPlatformIdAsync(platform: PLATFORM, token: string): Promise<string> {
    const fetchPlatformId = this.platformIdFetchers[platform];
    try {
      const id = await fetchPlatformId(token);
      if (!id) {
        throw ServerError.PLATFORM_LOGIN_FAILED;
      }

      return id;
    } catch (e) {
      throw ServerError.PLATFORM_LOGIN_FAILED;
    }
  }

  async getNaverIdAsync(token: string): Promise<string> {
    const api_url = 'https://openapi.naver.com/v1/nid/me';
    const header = `Bearer ${token}`;
    const response = await HttpUtil.get(api_url, {
      headers: {
        Authorization: header,
      },
    });

    return response?.['data']?.['response']?.['id'];
  }

  async getKakaoIdAsync(token: string): Promise<string> {
    const api_url = 'https://kapi.kakao.com/v2/user/me';
    const header = `Bearer ${token}`;
    const response = await HttpUtil.get(api_url, {
      headers: {
        Authorization: header,
      },
    });

    return response?.['data']?.['id'];
  }

  async getGoogleAsync(token: string): Promise<string> {
    const api_url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`;
    const response = await HttpUtil.get(api_url, {});

    return response?.['data']?.['sub'];
  }

  async createPlatformAccountAsync(platform: PLATFORM, id: string): Promise<DBAccount> {
    const useridx = await this.repository.increaseUseridx();
    const account: DBAccount = {
      useridx: useridx,
      id: `${platform}.${id}`,
      email: `${platform}.${id}`,
      nickname: `${CoreDefine.SERVICE_NAME}${useridx}`,
      password: '',
      platform: platform,
      create_date: new Date(),
    };

    return account;
  }

  async platformLogin(session: SessionData, platform: PLATFORM, id: string): Promise<DBAccount> {
    let account = await this.accountService.getAccountByIdAsync(platform, id);
    if (!account) {
      account = await this.createPlatformAccountAsync(platform, id);
      await this.accountService.upsertAccountAsync(account);
    }
    session.user = { useridx: account.useridx } as SessionUser;
    await this.accountService.setLoginStateAsync(account);

    return account;
  }
}
