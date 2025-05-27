import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import jwt, { Jwt, JwtPayload, VerifyOptions } from 'jsonwebtoken';
import ServerLogger from '../server-log/server.logger';

class CryptUtil {
  static jwtEncode(payload: object, secretKey: string, expiresSec: number): string {
    const token = jwt.sign(payload, secretKey, { algorithm: 'HS256', expiresIn: expiresSec });

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
      ServerLogger.error(e?.stack);

      return undefined;
    }
  }

  /**
   * 단방향 암호화
   */
  static hash(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * 단방향 암호화
   */
  static async hashWithSalt(str: string, salt: string | number): Promise<string> {
    return await bcrypt.hash(str, salt);
  }

  static async compareHash(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }
}

export default CryptUtil;
