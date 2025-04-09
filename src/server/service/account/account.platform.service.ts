import { Injectable } from '@nestjs/common';
import { SessionData } from '@root/core/auth/auth.schema';
import ServerConfig from '@root/core/config/server.config';
import { PLATFORM, ROLE } from '@root/core/define/define';
import ServerError from '@root/core/error/server.error';
import HttpUtil from '@root/core/utils/http.utils';
import StringUtil from '@root/core/utils/string.utils';
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
    const useridx = await this.repository.increaseidx();
    const account: DBAccount = {
      useridx: useridx,
      id: `${platform}.${id}`,
      nickname: `${StringUtil.toCapitalizedCamelCase(ServerConfig.service.name)}${useridx}`,
      platform: platform,
      role: ROLE.USER,
    };

    return account;
  }

  async platformLogin(session: SessionData, platform: PLATFORM, id: string): Promise<DBAccount> {
    let account = await this.accountService.getAccountByIdAsync(`${platform}.${id}`);
    if (!account) {
      account = await this.createPlatformAccountAsync(platform, id);
      await this.accountService.upsertAccountAsync(account);
    }
    session.user = {
      useridx: account.useridx,
      nickname: account.nickname,
      role: account.role,
    };
    await this.accountService.setLoginStateAsync(account);

    return account;
  }
}
