export class ResLogin {
  accessToken: string;
  refreshToken: string;
}

export class ResTokenRefresh {
  accessToken: string;
  refreshToken: string;
}

export class ResCreateUser {
  /**
   * 유저 닉네임
   */
  nickname: string;
}
