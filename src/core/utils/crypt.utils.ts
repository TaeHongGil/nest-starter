import bcrypt from 'bcryptjs';
import jwt, { Jwt, JwtPayload, TokenExpiredError, VerifyOptions } from 'jsonwebtoken';

export class CryptUtil {
  static atob(str: string): string {
    return Buffer.from(str, 'base64').toString('binary');
  }

  static btoa(str: string): string {
    return Buffer.from(str, 'utf8').toString('base64');
  }

  static jwtSignWithExpireSec(payload: object, secretKey: string, expireSec: number): string {
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256', expiresIn: expireSec });

    return token;
  }

  static jwtSignWithOption(payload: object, secretKey: string, option: jwt.SignOptions): string {
    const token = jwt.sign(payload, secretKey, option);

    return token;
  }

  static jwtDecode(token: string, options?: VerifyOptions): string | JwtPayload {
    const data = jwt.decode(token, options);

    return data;
  }

  static jwtVerify(token: string, secretKey: string, options?: VerifyOptions): Jwt | JwtPayload | string {
    try {
      const decoded = jwt.verify(token, secretKey, options);

      return decoded;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw Error(`jwt token expired. err:${e.message}`);
      } else {
        throw Error(`jwt token invalid. err:${e.message}`);
      }
    }
  }

  static async hash(str: string): Promise<string> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(str, saltRounds);

    return hashedPassword;
  }

  static async compareHash(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default CryptUtil;
