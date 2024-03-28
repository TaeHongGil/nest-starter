import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Swagger 세팅
 */
export async function setupSwagger(app: INestApplication, module: Function, endPoint: string) {
  let metadata: () => Promise<Record<string, any>>;
  const path = './metadata';

  try {
    const module = await import(path);
    metadata = module.default;
  } catch (error) {
    return;
  }
  const options = new DocumentBuilder().setTitle('Nest API Docs').setDescription('The last successful data is saved.').setVersion('0.0.1').build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, options, {
    include: [module],
  });
  const initFuncString = onLoadSwagger.toString();

  SwaggerModule.setup(endPoint, app, document, {
    customJsStr: [initFuncString.slice(initFuncString.indexOf('{') + 1, initFuncString.lastIndexOf('}'))],
    swaggerOptions: {
      docExpansion: 'none',
      showExtensions: 'ture',
      requestSnippetsEnabled: 'true',
      showCommonExtensions: 'true',
      defaultModelsExpandDepth: 100,
      defaultModelExpandDepth: 100,
      responseInterceptor: (res) => {
        if (res.ok) {
          var req = JSON.parse(sessionStorage.getItem('currentRequest'));
          const url = new URL(res.url);
          const pathname = `${url.pathname}_${req.method}`;
          //data save
          var requestData = JSON.parse(localStorage.getItem('requestData')) || {};
          if (requestData[pathname]) {
            requestData[pathname].body = req.body;
            requestData[pathname].parameters = req.parameters;
          } else {
            requestData[pathname] = { body: req.body, parameters: req.parameters };
          }
          localStorage.setItem('requestData', JSON.stringify(requestData));

          var responseData = JSON.parse(localStorage.getItem('responseData')) || {};
          if (responseData[pathname]) {
            responseData[pathname].body = res.body;
            responseData[pathname].status = res.status;
          } else {
            responseData[pathname] = { body: res.body, status: res.status };
          }
          localStorage.setItem('responseData', JSON.stringify(responseData));

          if (pathname.indexOf('account/login') > -1) {
            sessionStorage.setItem('userToken', res.body.content.login_result.token);
          }
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
        sessionStorage.setItem('currentRequest', JSON.stringify({ method: method, body: body, parameters: parameters }));
        const token = sessionStorage.getItem('userToken');
        req.headers.Authorization = `Bearer ${token}`;
        return req;
      },
    },
  });
}

async function onLoadSwagger() {
  window.addEventListener('load', async function () {
    const responseData = JSON.parse(localStorage.getItem('responseData')) || {};
    const requestData = JSON.parse(localStorage.getItem('requestData')) || {};
    const spec = JSON.parse(window['ui'].specSelectors.specStr());
    for (const [pathname, methods] of Object.entries(spec.paths)) {
      for (const [method, info] of Object.entries(methods)) {
        const storgeName = `${pathname}_${method}`;
        //data load
        if (responseData[storgeName]) {
          var res = responseData[storgeName];
          spec.paths[pathname][method].responses[res.status] = spec.paths[pathname][method].responses[res.status] || {};
          spec.paths[pathname][method].responses[res.status].content = spec.paths[pathname][method].responses[res.status].content || {};
          spec.paths[pathname][method].responses[res.status].content['application/json'] = { example: res.body };
        }
        if (requestData[storgeName]) {
          var req = requestData[storgeName];
          var schemaName = spec?.paths[pathname]?.[method]?.requestBody?.content['application/json']?.schema?.$ref;
          if (schemaName) {
            schemaName = schemaName.substring(schemaName.lastIndexOf('/') + 1);
            var data = req.body ? JSON.parse(req.body) : {};
            for (const [properties, info] of Object.entries(spec.components.schemas[schemaName].properties)) {
              if (data[properties]) {
                info['example'] = data[properties];
              }
            }
          }
          var parameters = spec?.paths[pathname]?.[method]?.parameters;
          for (var data of parameters) {
            var parm = req.parameters[data.name];
            if (parm) {
              data.schema['example'] = parm;
            }
          }
        }
      }
    }
    await window['ui'].specActions.updateJsonSpec(spec);
  });

  function handleDOMChanges(mutations) {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            node.querySelectorAll('.model-box-control').forEach((childNode) => {
              if (childNode.getAttribute('aria-expanded') === 'false') {
                childNode.click();
              }
            });
            node.querySelectorAll('.example').forEach((childNode) => {
              const newDiv = document.createElement('div');
              newDiv.className = 'copy-to-clipboard swagger-ui';
              const newButton = document.createElement('button');
              newButton.onclick = function () {
                navigator.clipboard.writeText(childNode.parentNode.textContent).then(
                  () => {},
                  () => {},
                );
              };
              newDiv.appendChild(newButton);
              childNode.appendChild(newDiv);
            });
            node.querySelectorAll('.property').forEach((childNode) => {
              if (childNode.textContent.indexOf('example') > -1) {
                childNode.textContent = '';
              }
            });
          }
        });
      }
    });
  }
  function initializeObserver() {
    const observer = new MutationObserver(handleDOMChanges);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
    } else {
      setTimeout(() => waitForElement(selector, callback), 100);
    }
  }

  waitForElement('.info', function (element) {
    const customButton = document.createElement('button');
    customButton.innerText = 'Data Reset';
    customButton.onclick = function () {
      localStorage.clear();
      location.reload();
    };
    element.appendChild(customButton);
  });

  initializeObserver();
}
