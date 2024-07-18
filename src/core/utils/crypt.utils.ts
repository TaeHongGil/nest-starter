import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt, { Jwt, JwtPayload, TokenExpiredError, VerifyOptions } from 'jsonwebtoken';
import zlib from 'zlib';

export function atob(str: string): string {
  return Buffer.from(str, 'base64').toString('binary');
}

export function btoa(str: string): string {
  return Buffer.from(str, 'utf8').toString('base64');
}

export function jwtSignWithExpireSec(payload: object, secretKey: string, expireSec: number): string {
  const token = jwt.sign(payload, secretKey, { algorithm: 'HS256', expiresIn: expireSec });
  return token;
}

export function jwtSignWithOption(payload: object, secretKey: string, option: jwt.SignOptions): string {
  const token = jwt.sign(payload, secretKey, option);
  return token;
}

export function jwtDecode(token: string, options?: VerifyOptions): string | JwtPayload {
  const data = jwt.decode(token, options);
  return data;
}

export function jwtVerify(token: string, secretKey: string, options?: VerifyOptions): Jwt | JwtPayload | string {
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

export async function cryptPasswordAsync(password: string): Promise<string> {
  return new Promise(function (resolve, reject) {
    bcrypt.genSalt(10, function (err, salt) {
      if (!err) {
        bcrypt.hash(password, salt, function (err, hash) {
          if (!err) {
            resolve(hash);
          } else {
            reject(err);
          }
        });
      } else {
        reject(err);
      }
    });
  });
}

export async function comparePasswordAsync(password: any, userPassword: any): Promise<boolean> {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, userPassword, function (err, isPasswordMatch) {
      if (!err) {
        resolve(isPasswordMatch);
      } else {
        reject(err);
      }
    });
  });
}

export function encodeObj(obj: any, key: string, iv: string): string {
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let output = cipher.update(JSON.stringify(obj), 'utf8', 'hex');
  output += cipher.final('hex');
  return output;
}

export function decodeStr(str: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let output = decipher.update(str, 'hex', 'utf8');
  output += decipher.final('utf8');
  return JSON.parse(output);
}

export function encodeAuthToken(auth: any, verify_code: string, key: string, iv: string, zip = false): string {
  let output = this.encodeObj(auth, key, iv);
  output += '|' + verify_code;

  if (zip) {
    output = zlib.deflateSync(Buffer.from(output, 'utf8')).toString('base64');
  }

  return output;
}

export function decodeAuthToken(str: string, key: string, iv: string, zip = false): string {
  if (zip) {
    str = zlib.inflateSync(Buffer.from(str, 'base64')).toString('utf-8');
  }

  const split = str.split('|');
  if (split.length < 2) {
    return null;
  }

  const output = this.decodeStr(split[0], key, iv);

  output.verify_code = split[1];

  return output;
}

export function parse_signed_request(signed_request: string, secret: string): string {
  const encoded_data = signed_request.split('.');
  // decode the data
  const sig = encoded_data[0];
  const json = atob(encoded_data[1]);
  const data = JSON.parse(json); // ERROR Occurs Here!

  // check algorithm - not relevant to error
  if (!data.algorithm || data.algorithm.toUpperCase() !== 'HMAC-SHA256') {
    throw Error('Unknown algorithm: ' + data.algorithm + '. Expected HMAC-SHA256');
  }

  // check sig - not relevant to error
  const expected_sig = crypto.createHmac('sha256', secret).update(encoded_data[1]).digest('base64').replace(/\+/g, '-').replace(/\//g, '_').replace('=', '');
  if (sig !== expected_sig) {
    throw Error('Invalid signature: ' + sig + '. Expected ' + expected_sig);
  }
  return data;
}
