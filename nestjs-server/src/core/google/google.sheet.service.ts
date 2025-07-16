import { Injectable } from '@nestjs/common';
import ServerConfig from '@root/core/config/server.config';
import fs from 'fs';
import { google } from 'googleapis';
import path from 'path';

@Injectable()
export class GoogleSheetService {
  private sheets = google.sheets('v4');
  private auth: any;
  private googleAccount: any;

  constructor() {
    const googleAccountPath = path.join(ServerConfig.paths.env, 'google-account.json');

    this.auth = new google.auth.GoogleAuth({
      keyFile: googleAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive.file'],
    });
    this.googleAccount = JSON.parse(fs.readFileSync(googleAccountPath, 'utf-8'));
  }

  /**
   * 구글 시트의 스프레드시트 ID로 시트 이름들을 가져온다.
   * @param spreadsheetId - 스프레드시트 ID
   */
  async getSheetNames(spreadsheetId: string): Promise<string[]> {
    const client = await this.auth.getClient();
    const response = await this.sheets.spreadsheets.get({
      auth: client,
      spreadsheetId,
    });

    return response.data.sheets.map((sheet) => sheet.properties.title);
  }

  /**
   * 시트의 데이터를 가져온다.
   * @param spreadsheetId - 스프레드시트 ID
   * @param sheetName - 시트 이름
   * @param range - 데이터 범위 (예: 'A1:C10')
   */
  async getSheetDataByName(spreadsheetId: string, sheetName: string, range: string): Promise<any> {
    const client = await this.auth.getClient();
    const response = await this.sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: `${sheetName}!${range}`,
    });

    return response.data.values;
  }

  /**
   * 드라이브 파일의 마지막 수정 시간을 가져온다.
   * @param fileId - 구글 드라이브 파일 ID
   */
  async getModifiedTime(fileId: string): Promise<string> {
    const client = await this.auth.getClient();
    const drive = google.drive({ version: 'v3', auth: client });
    const response = await drive.files.get({
      fileId,
      fields: 'modifiedTime',
    });

    return response.data.modifiedTime;
  }

  /**
   * 파일 URL에서 파일 ID를 추출한다.
   * @param fileUrl - 구글 드라이브 파일 URL
   */
  private extractFileIdFromUrl(fileUrl: string): string {
    const match = fileUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Drive file URL');
    }

    // Extract and return the file ID
    return match[1];
  }
}
