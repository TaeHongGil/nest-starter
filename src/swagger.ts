import { Type, type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import serverConfig from './core/config/server.config';

/**
 * Swagger 세팅
 */
export async function setupSwagger(app: INestApplication, module: Type[], endPoint: string): Promise<void> {
  if (!serverConfig.swagger.active) {
    return;
  }

  let metadata: () => Promise<Record<string, any>>;
  const path = './metadata';

  try {
    const module = await import(path);
    metadata = module.default;
  } catch (error) {
    return;
  }
  const options = new DocumentBuilder().setTitle('Nest API Docs').setDescription('last successful data is saved.').setVersion('0.0.1').build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, options, {
    include: module,
  });

  SwaggerModule.setup(endPoint, app, document, {
    customJs: ['/custom-ui.js'],
    swaggerOptions: {
      docExpansion: 'none',
      showExtensions: 'ture',
      requestSnippetsEnabled: 'true',
      showCommonExtensions: 'true',
      defaultModelsExpandDepth: 100,
      defaultModelExpandDepth: 100,
      responseInterceptor: (res) => {
        if (res.ok) {
          const req = JSON.parse(sessionStorage.getItem('currentRequest'));
          const url = new URL(res.url);
          const pathname = `${url.pathname}_${req.method}`;
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
          console.log(res);
        }
        sessionStorage.removeItem('currentRequest');
      },
      requestInterceptor: (req) => {
        const method = req.method.toLowerCase();
        const url = new URL(req.url);
        const body = req.body;
        const parameters = {};
        for (const [key, value] of url.searchParams.entries()) {
          parameters[key] = value;
        }
        sessionStorage.setItem('currentRequest', JSON.stringify({ method, body, parameters }));
        return req;
      },
    },
  });
}
