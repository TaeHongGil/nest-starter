import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';

import { applyCommonDecorators, getFileList, responseSave, setStaticPath as setResponsePath, setUseDefault } from './swagger-utils';

/**
 * Swagger 옵션
 */
export interface SwaggerOptions {
  /**
   * API 생성할 모듈
   */
  includeModules: any[];

  /**
   * Swagger 기본 Response 사용 여부
   * default: false
   */
  useDeafult?: boolean;

  /**
   * token: 인증토큰 받아올 api 및 body주소
   * header: 추가할 기본 헤더 (Authorization 제외)
   */
  config?: {
    token?: { api: string; body: string };
    header?: Record<string, any>;
  };
}

/**
 * Swagger 세팅
 */
export async function setupSwagger(app: NestExpressApplication, options: SwaggerOptions): Promise<void> {
  let metadata: () => Promise<Record<string, any>>;
  const path = './metadata';
  try {
    const module = await import(path);
    metadata = module.default;
  } catch (error) {
    return;
  }

  const httpAdapter = app.getHttpAdapter();
  const expressApp = httpAdapter.getInstance();
  expressApp.post('/response/save', (req, res) => {
    responseSave(req, res).catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to save response' });
    });
  });

  expressApp.get('/response/list', (req, res) => {
    getFileList(req, res).catch((error) => {
      console.error(error);
      res.status(500).json({ error: 'Failed to read folder' });
    });
  });

  await applyCommonDecorators(app, await metadata());

  app.useStaticAssets(join(__dirname, '../../src/swagger/ui'));
  setResponsePath(join(__dirname, '../../src/swagger/response'));
  setUseDefault(options.useDeafult);

  const documentOptions = new DocumentBuilder().setTitle('Game API Docs').setDescription('Server Save 체크시 Response 저장됩니다.').build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const swaggerDocument = SwaggerModule.createDocument(app, documentOptions, { include: options.includeModules, deepScanRoutes: true });

  SwaggerModule.setup('api-docs', app, swaggerDocument, {
    customJs: ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js', '/custom-ui.js'],
    customCssUrl: ['https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css', '/custom-css.css'],
    swaggerOptions: {
      docExpansion: 'none',
      defaultModelRendering: 'model',
      showExtensions: 'ture',
      requestSnippetsEnabled: 'true',
      showCommonExtensions: 'true',
      defaultModelsExpandDepth: 100,
      defaultModelExpandDepth: 100,
      configs: options.config,
      responseInterceptor: async (res: any) => {
        if (res.ok) {
          const req = JSON.parse(sessionStorage.getItem('currentRequest'));
          const url = new URL(res.url);
          const pathname = `${url.pathname}_${req.method}`.toLowerCase();
          // data save
          const requestData = JSON.parse(localStorage.getItem('requestData')) || {};
          if (requestData[pathname]) {
            requestData[pathname].body = req.body;
            requestData[pathname].parameters = req.parameters;
          } else {
            requestData[pathname] = {
              body: req.body,
              parameters: req.parameters,
            };
          }
          localStorage.setItem('requestData', JSON.stringify(requestData));

          const responseData = JSON.parse(localStorage.getItem('responseData')) || {};
          if (responseData[pathname]) {
            responseData[pathname].body = res.body;
            responseData[pathname].status = res.status;
          } else {
            responseData[pathname] = { body: res.body, status: res.status };
          }
          localStorage.setItem('responseData', JSON.stringify(responseData));

          // 토큰저장
          if (window['ui'].configs && window['ui'].configs.token && url.pathname.indexOf(window['ui'].configs.token.api) >= 0) {
            const token = window['ui'].configs.token.body.split('.').reduce((acc, part) => acc && acc[part], res.body);
            if (token) {
              window['updateTokenDisplay'](token);
            }
          }

          // 서버 저장
          const checkbox = document.getElementById(`${pathname}_checkbox`);
          if (checkbox && checkbox['checked']) {
            window['responseSave'](pathname, res.body);
            window['changeExample'](document.getElementById(`${pathname}_example`), res.body);
          }
          console.log(res);
        }
        sessionStorage.removeItem('currentRequest');
      },
      requestInterceptor: (req: any) => {
        const method = req.method.toLowerCase();
        const url = new URL(req.url);
        const body = req.body;
        const parameters = {};
        for (const [key, value] of url.searchParams.entries()) {
          parameters[key] = value;
        }
        sessionStorage.setItem('currentRequest', JSON.stringify({ method: method, body: body, parameters: parameters }));

        req.headers.Authorization = (document.getElementById('userToken') as HTMLInputElement).value.trim();

        if (window['globalHeaders']) {
          const globalHeaders = {};
          for (const [key, value] of Object.entries(window['globalHeaders'])) {
            const value = (document.getElementById(`${key}Input`) as HTMLInputElement).value.trim();
            req.headers[key] = value;
            globalHeaders[key] = value;
          }
          localStorage.setItem('globalHeaders', JSON.stringify(globalHeaders));
        }
        return req;
      },
    },
  });
}
