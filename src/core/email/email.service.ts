import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as nodemailer from 'nodemailer';
import path from 'path';
import ServerConfig from '../config/server.config';
import ServerError from '../error/server.error';
import { ServerLogger } from '../server-log/server.log.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: nodemailer.Transporter;

  onModuleInit(): void {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ServerConfig.stmp.email,
        pass: ServerConfig.stmp.app_password,
      },
    });
  }

  async sendMail(from: string, to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: `"${from}" <${ServerConfig.stmp.email}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      ServerLogger.log(`Email sent to ${to}`);
    } catch (error) {
      throw ServerError.MAIL_ERROR;
    }
  }

  async readHtml(type: string, replace: Record<string, string> = {}): Promise<string> {
    let content = fs.readFileSync(path.join(ServerConfig.paths.env, 'email', `${type}.html`), { encoding: 'utf8' });
    for (const [key, value] of Object.entries(replace)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }

    return content;
  }
}
