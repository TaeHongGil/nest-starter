export class ResLogin {
  accessToken: string;
  refreshToken: string;
  nickname: string;
}

export class ResTokenRefresh {
  accessToken: string;
}

export class ResCreateUser {
  /**
   * 유저 닉네임
   */
  nickname: string;
}
