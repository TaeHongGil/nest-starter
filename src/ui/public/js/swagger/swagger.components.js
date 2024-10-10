//@ sourceURL=swagger.components
import SwaggerUtil from './swagger.util.js';

class Header {
  constructor() {
    this.$headersContainer = $('<div>').attr('id', 'headers-container').addClass('headers-container');
    this.$headerKeyInput = $('<input>').attr({
      type: 'text',
      id: 'headerKeyInput',
      placeholder: 'Header Key',
    });
    this.$headerValueInput = $('<input>').attr({
      type: 'text',
      id: 'headerValueInput',
      placeholder: 'Header Value',
    });
    this.$addHeaderButton = $('<button>').attr('id', 'addHeaderButton').addClass('btn btn-success btn-sm').text('Add Header');
    this.$userToken = $('<textarea>').attr({
      id: 'user-token',
      class: 'token-textarea',
      rows: '1',
      disabled: true,
    });
    this.$tokenTime = $('<label>').attr('id', 'token-time');
    this.$serversContainer = $('<div>').attr('id', 'servers-container').addClass('mb-4');

    this.$component = $('<div>').append(
      $('<h3>').text('Global Header'),
      this.$headersContainer,
      $('<div>').addClass('add-header-container mb-4').append(this.$headerKeyInput, this.$headerValueInput, this.$addHeaderButton),
      $('<div>').addClass('mb-4').append('Authorization', this.$userToken, 'Token Generated Time:', this.$tokenTime),
      this.$serversContainer,
    );

    this.$addHeaderButton.on('click', this.addHeaders.bind(this));
    this.populateServers();
    this.$userToken.text(this.setDefaultToken());
    this.$tokenTime.text(this.setDefaultTime());
    this.setDefaultHeader();
  }

  getComponent() {
    return this.$component;
  }

  populateServers() {
    let isFirst = true;

    $.each(window.servers, (zone, server) => {
      if (server) {
        const $serverElement = $('<div>').addClass('form-check');
        const $input = $('<input>')
          .addClass('form-check-input')
          .attr({
            type: 'radio',
            name: 'server-radio',
            id: `server-radio${zone}`,
            value: server,
          })
          .prop('checked', isFirst);

        const $label = $('<label>')
          .addClass('form-check-label')
          .attr('for', `server-radio${zone}`)
          .css('font-weight', 'bold')
          .text(zone)
          .append(
            $('<span>')
              .css({
                color: 'gray',
                fontWeight: 'normal',
              })
              .text(` ${server}`),
          );

        $serverElement.append($input, $label);
        this.$serversContainer.append($serverElement);
        isFirst = false;
      }
    });
  }

  addGlobalHeader(key, value) {
    window['globalHeaders'][key] = value;
    localStorage.setItem('globalHeaders', JSON.stringify(window['globalHeaders']));
    this.updateHeadersDisplay();
  }

  removeGlobalHeader(key) {
    delete window['globalHeaders'][key];
    this.updateHeadersDisplay();
  }

  setDefaultHeader() {
    const storedHeaders = localStorage.getItem('globalHeaders');
    if (storedHeaders) {
      window['globalHeaders'] = JSON.parse(storedHeaders);
    } else if (window.config?.header) {
      window['globalHeaders'] = window.config.header;
    } else {
      window['globalHeaders'] = {};
    }
    this.updateHeadersDisplay();
  }

  updateHeadersDisplay() {
    this.$headersContainer.empty();

    $.each(window['globalHeaders'], (key, value) => {
      const $headerElement = $('<div>');
      const $keySpan = $('<span>').text(key);
      const $removeButton = $('<button>')
        .addClass('btn-x')
        .text('x')
        .on('click', () => this.removeGlobalHeader(key));
      const $textarea = $('<textarea>')
        .addClass('headers-textarea')
        .attr({
          name: key,
          rows: 1,
        })
        .val(value);

      $headerElement.append($keySpan, $removeButton, $textarea);
      this.$headersContainer.append($headerElement);
    });
  }

  addHeaders() {
    const key = this.$headerKeyInput.val();
    const value = this.$headerValueInput.val();

    if (key && value) {
      this.addGlobalHeader(key, value);
      this.clearHeaderInputs();
    }
  }

  clearHeaderInputs() {
    this.$headerKeyInput.val('');
    this.$headerValueInput.val('');
  }

  setDefaultToken() {
    const userToken = sessionStorage.getItem('user-token');
    if (userToken) {
      const parsedToken = JSON.parse(userToken).token;
      return `Bearer ${parsedToken}`;
    }
    return window.config?.token?.api ? `Please ${window.config.token.api}` : 'Not Used';
  }

  setDefaultTime() {
    const userToken = sessionStorage.getItem('user-token');
    if (userToken) {
      const tokenTime = new Date(JSON.parse(userToken).time);
      return tokenTime;
    }
    return '-';
  }
}

class Sidebar {
  constructor() {
    this.tagList = [];
    this.apiList = [];
    this.$sidebarContainer = $('<div>').addClass('list-group list-group-flush sidebar-container').attr('id', 'sidebar-container');
    this.$collapseAllButton = $('<button>').addClass('btn btn-info btn-sm').attr('id', 'collapseAllButton').text('Collapse All');
    this.$component = $('<div>')
      .addClass('sidebar-section')
      .attr('id', 'sidebar-section')
      .append(
        $('<div>')
          .addClass('border-end bg-white')
          .attr('id', 'sidebar-wrapper')
          .append($('<div>').addClass('sidebar-heading border-bottom bg-light').append('API List ', this.$collapseAllButton), this.$sidebarContainer),
      );
    this.$collapseAllButton.on('click', collapseAll);
    this.init();
  }

  getComponent() {
    return this.$component;
  }

  init() {
    const spec = window.spec;

    spec.tags.forEach((tag) => {
      const $tagGroup = $('<div>').addClass('tag-group');
      const $tagHeader = $('<div>')
        .addClass('list-group-item list-group-item-secondary')
        .text(tag.name)
        .on('click', () => toggleHidden(`side-${tag.name}`));
      const $sideTag = $('<div>').addClass('side-tag toggle-component hidden').attr('id', `side-${tag.name}`);

      for (const [path, methods] of Object.entries(spec.paths)) {
        for (const [methodType, method] of Object.entries(methods)) {
          if (method.tags.includes(tag.name)) {
            const $apiItem = $('<div>').addClass('list-group-item list-group-item-action list-group-item-light p-2 api-list mr-elements').attr({
              tag: tag.name,
              method: methodType,
              path: path,
            });
            const $methodBadge = $('<span>').addClass(`method-badge small text-uppercase ${methodType.toUpperCase()}`).text(methodType[0]);
            const $path = $('<span>').text(path);

            $apiItem.append($methodBadge).append($path);
            $sideTag.append($apiItem);
            this.apiList.push($apiItem);
          }
        }
      }
      this.tagList.push($sideTag);
      $tagGroup.append($tagHeader).append($sideTag);
      this.$sidebarContainer.append($tagGroup);
    });

    $(document).trigger('sidebarInitialized', {
      tags: this.tagList,
      apis: this.apiList,
    });
  }
}

class HttpContainer {
  constructor(method, path) {
    const info = spec.paths[path][method];
    this.$component = $('<div>').addClass('http-container');
    this.$requestContainer = this.createRequestContainer(method, path, info);
    this.$responseContainer = this.createResponseContainer();

    this.$requestContainer.find('.btn-excute').on('click', () => this.executeRequest(this.$requestContainer, this.$responseContainer));

    this.$component.append(this.$requestContainer, this.$responseContainer);
  }

  getComponent() {
    return this.$component;
  }

  createRequestContainer(method, path, info) {
    const $container = $('<div>').addClass('request-container').attr('method', method).attr('path', path);
    const $subject = $('<div>').addClass('subject');
    const $requestLabel = $('<div>').text('Request');
    const $executeButton = $('<button>').addClass('btn btn-primary btn-excute').text('Execute');
    $subject.append($requestLabel, $executeButton);

    const appendElements = [$subject];
    if (info.parameters.length > 0) {
      const $parametersLabel = $('<label>').text('Parameters');
      appendElements.push($parametersLabel);

      const $parameterTable = $('<table>').addClass('parameter-table');
      const $tbody = $('<tbody>');

      info.parameters.forEach((parameter) => {
        const $tr = this.createParameterRow(parameter, method, path);
        $tbody.append($tr);
        $parameterTable.append($tbody);
      });
      appendElements.push($parameterTable);
    }

    if (info.requestBody) {
      const $bodyDiv = $('<div>').addClass('mr-elements');
      const $bodyLabel = $('<label>').text('Request Body');
      const $editingContainer = this.createEditContainer();
      const $editingTextarea = $editingContainer.find('textarea');
      const $code = $editingContainer.find('code');
      const $copyButton = $('<button>')
        .addClass('btn btn-success btn-sm')
        .on('click', () => copyCode($code))
        .text('Copy');

      $bodyDiv.append($bodyLabel, $copyButton);
      appendElements.push($bodyDiv, $editingContainer);

      const schemaName = info.requestBody?.['content']?.['application/json']?.['schema']?.['$ref'];
      if (schemaName) {
        const schemaData = SwaggerUtil.resolveRef(schemaName);
        const $schemaLabel = $('<div>').append($('<label>').text(`Schema - ${schemaData.name}`));
        const $schemaComponent = new Schema(schemaData.data);
        const $schemaContainer = $('<div>').addClass('schema-detail-container').append($schemaComponent.getComponent());
        appendElements.push($schemaLabel, $schemaContainer);
        this.setRequestDefaultBody($editingTextarea, $code, method, path, schemaData);
        const $bodyResetButton = $('<button>')
          .addClass('btn btn-sm btn-danger')
          .text('Reset')
          .on('click', () => this.setRequestDefaultBody($editingTextarea, $code, method, path, schemaData, true));
        $bodyDiv.append($bodyResetButton);
      }
    }

    $container.append(appendElements);
    return $container;
  }

  createEditContainer() {
    const $editingContainer = $('<div>').addClass('editing-container');
    const $editingTextarea = $('<textarea>').addClass('editing-code').attr('spellcheck', 'false');
    const $pre = $('<pre>').addClass('body-pre rounded');
    const $code = $('<code>').addClass('json');
    $pre.append($code);
    $editingContainer.append($editingTextarea, $pre);
    $editingTextarea.on('input', (e) => this.updateCode(e.target, $code[0]));
    if ($pre.length) {
      this.setupResizeObserver($pre);
    }
    return $editingContainer;
  }

  setRequestDefaultBody($textarea, $code, method, path, schemaData, isReset) {
    if (isReset) {
      delete swaggerStorge.lastRequest?.[`${method}_${path}`];
    }
    const defaultBody = swaggerStorge.lastRequest?.[`${method}_${path}`]?.body || this.getRequestDefaultBody(schemaData.data.properties);
    $textarea.val(defaultBody);
    this.updateCode($textarea[0], $code[0]);
  }

  createParameterRow(parameter, method, path) {
    const $tr = $('<tr>');
    const $tdInfo = $('<td>').addClass('parameter-info-td');
    const $parameterName = $('<span>').addClass('parameter-name').text(parameter.name);
    const $requiredSpan = $('<span>')
      .addClass('red-text')
      .text(parameter.required ? '*' : '');
    const $parameterIn = $('<span>').addClass('parameter-in').text(parameter.in);

    $tdInfo.append($parameterName, $requiredSpan, $parameterIn);

    const saveParams = swaggerStorge.lastRequest?.[`${method}_${path}`]?.parameters;
    const saveValue = saveParams ? (parameter.in == saveParams[parameter.name]?.in ? saveParams[parameter.name].value : '') : '';
    const $tdInput = $('<td>').addClass('parameter-input-td');
    const $textarea = $('<textarea>').addClass('parameter-input').val(saveValue);

    $tdInput.append($textarea);
    $tr.append($tdInfo, $tdInput);

    return $tr;
  }

  setupResizeObserver($pre) {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const $container = $(entry.target).parent();
        const $edit = $container.find('.editing-code');
        const $code = $container.find('code');
        const top = parseFloat($edit.css('top'));

        $container.height(entry.contentRect.height + top * 2);
        $edit.width($code.width());
        $edit.height($code.height());
      });
    });
    resizeObserver.observe($pre[0]);
  }

  createResponseContainer() {
    const $container = $('<div>').addClass('response-container');
    const $subject = $('<div>').addClass('subject').text('Response');
    const $requestUrlLabel = $('<label>').text('Request URL');
    const $urlPre = $('<pre>').addClass('response-url');
    const $codeLabel = $('<label>').text('Code');
    const $statusPre = $('<pre>').addClass('response-status');
    const $bodyDiv = $('<div>').addClass('mr-elements');
    const $bodyLabel = $('<label>').text('Response Body');
    const $editingContainer = this.createEditContainer();
    $editingContainer.addClass('response-body');
    const $headersLabel = $('<label>').text('Response Headers');
    const $headersPre = $('<pre>').addClass('response-header');
    const $headersCode = $('<code>').addClass('text');
    $headersPre.append($headersCode);
    const $bodyCopyButton = $('<button>')
      .addClass('btn btn-success btn-sm')
      .on('click', () => copyCode($editingContainer.find('code')))
      .text('Copy');
    $bodyDiv.append($bodyLabel, $bodyCopyButton);

    $container.append($subject, $requestUrlLabel, $urlPre, $codeLabel, $statusPre, $bodyDiv, $editingContainer, $headersLabel, $headersPre);

    return $container;
  }

  /**
   * 코드 블록을 업데이트하고 하이라이트 적용
   * @param {HTMLElement} element - 업데이트할 코드 블록을 포함하는 요소
   */
  updateCode(element, code) {
    let text = element.value;

    if (text[text.length - 1] === '\n') {
      text += '  ';
    } else if (text === '') {
      text += '\n  ';
    } else if (text.indexOf('\n', 1) < 0) {
      text += '\n  ';
    }
    code.innerHTML = text;

    if (code.dataset.highlighted) {
      code.classList.remove('highlighted');
      delete code.dataset.highlighted;
    }

    hljs.highlightElement(code);
  }

  /**
   * Request의 기본 본문을 생성
   * @param {Object} properties - Request의 속성 객체
   * @returns {string} - 포맷된 기본 본문 문자열
   */
  getRequestDefaultBody(properties) {
    return this.formatObject(properties);
  }

  /**
   * 객체 타입의 속성을 포맷하여 반환
   */
  formatObject(properties, depth = 0) {
    if (!properties) {
      return '{}';
    }
    const indentation = '  '.repeat(depth);
    const content = this.getDefaultProperties(properties, depth);
    return `{\n${content}\n${indentation}}`;
  }

  /**
   * 기본 속성들을 포맷하여 반환
   */
  getDefaultProperties(properties, depth = 0) {
    return Object.entries(properties)
      .map(([propName, propDetails], index, array) => this.formatProperty(propName, propDetails, depth, index === array.length - 1))
      .join('\n');
  }

  /**
   * 속성을 포맷하여 반환
   */
  formatProperty(propName, propDetails, depth, isLast) {
    const indentation = '  '.repeat(depth + 1);
    const propertyName = propName ? `"${propName}": ` : '';
    const value = this.getPropertyValue(propDetails, depth, isLast);
    const comment = propDetails.type !== 'array' && propDetails.description ? ` // ${propDetails.description}` : '';
    const comma = propDetails.type !== 'array' ? (isLast ? '' : ',') : '';

    return `${indentation}${propertyName}${value}${comma}${comment}`;
  }

  /**
   * 속성의 값을 반환
   */
  getPropertyValue(propDetails, depth, isLast) {
    if (propDetails['$ref']) {
      const schema = SwaggerUtil.resolveRef(propDetails['$ref']);
      return this.formatObject(schema.data.properties, depth + 1);
    }
    switch (propDetails.type) {
      case 'array':
        return this.formatArray(propDetails, depth, isLast);
      case 'object':
        return this.formatObject(propDetails.properties, depth + 1);
      case 'number':
        return '0';
      default:
        return `"${propDetails.type}"`;
    }
  }

  /**
   * 배열 타입의 속성을 포맷하여 반환
   */
  formatArray(propDetails, depth, isLast) {
    let prop = propDetails;
    let arrayDepth = 0;
    let beforeProp = null;

    while (prop && prop.type === 'array') {
      arrayDepth++;
      beforeProp = prop;
      prop = prop.items;
    }
    const innerValue = this.getPropertyValue(prop, depth + arrayDepth);
    const innerIndentation = '  '.repeat(depth + arrayDepth + 1);
    const outerIndentation = '  '.repeat(depth + 1);

    let result = '[ '.repeat(arrayDepth) + '\n' + `${innerIndentation}${innerValue}\n` + `${outerIndentation}` + '] '.repeat(arrayDepth - 1) + ']';
    result += isLast ? '' : ',';
    if (beforeProp && beforeProp.description) {
      result += ` // ${beforeProp.description}`;
    }

    return result;
  }
  /**
   * API 요청을 실행
   */
  executeRequest($requestContainer, $responseContainer) {
    showLoading();

    const path = $requestContainer.attr('path');
    const method = $requestContainer.attr('method');
    const parameters = this.getExcuteParameters($requestContainer);
    const requestBody = $requestContainer.find('.editing-code').val();

    const requestData = {
      method: method,
      path: path,
      date: new Date(),
      parameters: parameters,
      url: this.constructUrl(path, parameters),
      headers: this.getExcuteHeaders(),
      body: requestBody,
    };

    var responseXhr;
    var isError = false;
    this.excute(requestData)
      .done((response, textStatus, jqXHR) => {
        responseXhr = jqXHR;
        console.log('Success:', response);
      })
      .fail((jqXHR, textStatus, errorThrown) => {
        responseXhr = jqXHR;
        isError = true;
        console.error('Error:', textStatus, errorThrown);
      })
      .always(() => {
        const responseJSON = responseXhr.responseJSON;
        const responseData = {
          url: requestData.url || 'N/A',
          status: `${responseXhr.status} : ${window.statusJson[responseXhr.status]?.['message'] || 'Unknown Error'}`,
          body: isError ? JSON.stringify(responseJSON, null, 2) : this.addResponseDescription(responseJSON),
          header: responseXhr.getAllResponseHeaders() || 'No response headers',
        };
        this.setResponseContainer(requestData, responseData, $responseContainer, isError);
        this.saveStorgedata(responseJSON, requestData, responseData);
        this.updateTokenDisplay(requestData, responseJSON);
        hideLoading();
      });
  }

  saveStorgedata(responseJSON, requestData, responseData) {
    if (!swaggerStorge.history) {
      swaggerStorge.history = [];
    }
    swaggerStorge.history.unshift({
      request: requestData,
      response: responseData,
    });

    //에러 아닌경우 저장
    if (!responseJSON.error) {
      if (!swaggerStorge.lastRequest) {
        swaggerStorge.lastRequest = {};
      }
      swaggerStorge.lastRequest[`${requestData.method}_${requestData.path}`] = requestData;
    }
  }

  /**
   * 응답 컨테이너를 설정
   */
  setResponseContainer(requestData, responseData, $container, isError = false) {
    const $url = $container.find('.response-url');
    const $status = $container.find('.response-status');
    const $body = $container.find('.response-body code');
    const $textarea = $container.find('.response-body textarea');
    const $header = $container.find('.response-header code');
    $url.text(requestData.url);
    $status.text(responseData.status);
    $body.text(responseData.body);
    $textarea.val(responseData.body);
    $header.text(responseData.header);
    [$body[0], $header[0]].forEach((element) => {
      if (element.dataset.highlighted) {
        $(element).removeClass('highlighted');
        delete element.dataset.highlighted;
      }
      hljs.highlightElement(element);
    });
  }

  /**
   * Request Body 주석 제거
   */
  getExcuteBody(body) {
    return body ? body.replace(/\/\/.*/g, '') : `{}`;
  }

  /**
   * Request의 파라미터를 가져오는 함수
   */
  getExcuteParameters($requestContainer) {
    const parameters = {};
    $requestContainer.find('.parameter-table tr').each((_, parameter) => {
      const $parameter = $(parameter);
      const name = $parameter.find('.parameter-name').text().trim();
      const _in = $parameter.find('.parameter-in').text().trim();
      const _value = $parameter.find('.parameter-input').val().trim();
      parameters[name] = {
        in: _in,
        value: _value,
      };
    });
    return parameters;
  }

  /**
   * Request의 헤더를 가져오는 함수
   */
  getExcuteHeaders() {
    const headers = {};
    $('#headers-container .headers-textarea').each((_, textarea) => {
      const $textarea = $(textarea);
      const headerName = $textarea.attr('name').trim();
      const headerValue = $textarea.val().trim();
      headers[headerName] = headerValue;
    });
    headers['Authorization'] = $('#user-token').val();
    return headers;
  }

  /**
   * Request URL을 생성
   */
  constructUrl(path, parameters) {
    const server = document.querySelector('input[name="server-radio"]:checked').value;

    Object.keys(parameters).forEach((name) => {
      const param = parameters[name];
      if (param.in === 'path') {
        path = path.replace(`{${name}}`, param.value);
      } else if (param.in === 'query' && param.value) {
        const separator = path.includes('?') ? '&' : '?';
        path += `${separator}${name}=${param.value}`;
      }
    });

    return this.joinUrl(server, path);
  }

  joinUrl(baseUrl, relativePath) {
    return new URL(relativePath, baseUrl).toString();
  }

  /**
   * AJAX 요청을 실행
   */
  excute(data) {
    return $.ajax({
      url: data.url,
      method: data.method,
      headers: data.headers,
      data: this.getExcuteBody(data.body),
      contentType: 'application/json',
    });
  }

  /**
   * 토큰을 세션 스토리지에 저장하고 화면에 표시
   */
  updateTokenDisplay(requestData, responseJson, time = new Date()) {
    if (requestData.url.includes(window?.config?.token?.api)) {
      const token = window.config.token.body.split('.').reduce((acc, part) => acc && acc[part], responseJson);
      if (token) {
        sessionStorage.setItem(
          'user-token',
          JSON.stringify({
            token: token,
            time: time,
          }),
        );
        $('#user-token').text(`Bearer ${token}`);
        $('#token-time').text(time);
      }
    }
  }

  /**
   * 스키마와 일치하는 객체를 찾음
   */
  findMatchingObject(response) {
    let matchingObjects = [];
    this.responseTraversal(response, 1, matchingObjects);
    return this.removeDuplicates(matchingObjects);
  }

  /**
   * 프로퍼티 체크
   */
  checkProperties(obj, objectSchema) {
    const requiredProperties = objectSchema.required;
    const properties = Object.keys(objectSchema.properties);

    if (!requiredProperties) {
      return false;
    }

    for (let prop of requiredProperties) {
      if (!obj.hasOwnProperty(prop)) {
        return false;
      }
    }

    for (let prop in obj) {
      if (!properties.includes(prop)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 응답을 순회하며 객체를 검사하는 내부 함수
   * @param {Object} obj - 순회할 응답 객체
   * @param {number} depth - 현재 깊이
   */
  responseTraversal(obj, depth, matchingObjects) {
    // 현재 객체 검사
    for (let objKey in spec.components.schemas) {
      if (spec.components.schemas[objKey].type === 'object' && this.checkProperties(obj, spec.components.schemas[objKey])) {
        matchingObjects.push({
          key: objKey,
          properties: spec.components.schemas[objKey].properties,
          depth: depth,
        });
      }
    }

    // 객체의 속성들을 재귀적으로 순회
    for (let key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        this.responseTraversal(obj[key], depth + 1, matchingObjects);
      }
    }
  }

  /**
   * 중복된 객체를 제거
   */
  removeDuplicates(array) {
    const seen = new Set();
    return array.filter((item) => {
      if (seen.has(item.key)) {
        return false;
      } else {
        seen.add(item.key);
        return true;
      }
    });
  }

  /**
   * 응답에 설명을 추가
   */
  addResponseDescription(body) {
    const matchObj = this.findMatchingObject(body);
    let result = JSON.stringify(body, null, 2);
    matchObj.forEach((obj) => {
      result = this.addDescription(result, obj);
    });
    return result;
  }

  /**
   * 응답 본문에 속성 설명을 추가
   */
  addDescription(body, obj) {
    if (!body || !obj || Object.keys(obj).length === 0) {
      return;
    }

    const bodyLines = body.split('\n');
    const depth = obj.depth;
    const properties = obj.properties;
    const propertiesKeys = Object.keys(properties);
    const commentedKeys = new Set();

    return bodyLines
      .map((line) => {
        const currentDepth = line.match(/^ */)[0].length / 2;
        const trimmedLine = line.trim();

        for (const key of propertiesKeys) {
          if (commentedKeys.has(key)) {
            continue;
          }

          if (trimmedLine.includes(`"${key}":`) && !trimmedLine.includes('//') && currentDepth === depth) {
            const description = properties[key].description;
            if (description) {
              commentedKeys.add(key);
              return `${line} // ${description}`;
            }
          }
        }

        return line;
      })
      .join('\n');
  }
}

class Schema {
  constructor(schema) {
    this.$component = this.generateSchemaTable(schema);
  }

  getComponent() {
    return this.$component;
  }

  generateSchemaTable(schema) {
    const { properties, required = schema.properties?.required } = schema;
    const $table = $('<table>').addClass('schema-table');
    const propertiesEntry = Object.entries(properties);
    if (propertiesEntry.length == 0) {
      $table.append($('<div>').addClass('m-2').text('Empty Object'));
      return $table;
    }
    for (const [propName, propDetails] of propertiesEntry) {
      const $row = $('<tr>').addClass('schema-prop');

      const $nameCell = $('<td>').text(propName);

      if (required?.includes(propName) || propDetails.required) {
        $nameCell.append($('<span>').addClass('red-text').text(' *'));
      }

      const $detailsCell = $('<td>');
      const $typeDiv = $('<div>');

      if (propDetails.type) {
        if (propDetails.type === 'array' && propDetails.items) {
          $typeDiv.append(this.getArrayTypeHtml(propDetails.items));
        } else {
          $typeDiv.append($('<span>').addClass('schema-type').text(propDetails.type));
        }
      } else if (propDetails.$ref) {
        const refSchema = SwaggerUtil.resolveRef(propDetails.$ref);
        const $refSpan = $('<span>');
        $refSpan
          .addClass('schema-ref')
          .on('click', () => this.scrollToSchema(refSchema.name))
          .text(refSchema.name);
        $typeDiv.append($refSpan);
      }

      if (propDetails.properties) {
        $typeDiv.append(this.generateSchemaTable(propDetails));
      }
      $detailsCell.append($typeDiv);

      const excludeProp = ['type', 'description', '$ref', 'properties', 'items', 'required', 'default'];
      $.each(propDetails, function (key, value) {
        if (!excludeProp.includes(key)) {
          $detailsCell.append($('<div>').text(`${key}: ${value}`));
        }
      });

      if (propDetails.description) {
        $detailsCell.append($('<div>').text(propDetails.description));
      }

      $row.append($nameCell).append($detailsCell);
      $table.append($row);
    }
    return $table;
  }

  /**
   * 배열 타입의 HTML을 생성하는 함수
   */
  getArrayTypeHtml(items, typeText = '', depth = 1) {
    if (items.type === 'array') {
      return this.getArrayTypeHtml(items.items, typeText, depth + 1);
    }
    const $span = $('<span>');
    if (items.$ref) {
      const refSchema = SwaggerUtil.resolveRef(items.$ref);
      $span
        .addClass('schema-ref')
        .on('click', () => this.scrollToSchema(`${refSchema.name}`))
        .text(refSchema.name);
    } else {
      $span.addClass('schema-type').text(items.type);
    }
    return $span.add(document.createTextNode('[]'.repeat(depth)));
  }

  /**
   * 특정 스키마 섹션으로 스크롤하는 함수
   * @param {string} schemaName - 스크롤할 스키마의 이름
   */
  scrollToSchema(schemaName) {
    const $schemaElement = safeSelect(`${schemaName}-details`);
    const $control = $('#schema-control');
    const $info = $('#schema-info');

    if ($control.length && $info.hasClass('hidden')) {
      $control.click();
    }
    if ($schemaElement.length) {
      $schemaElement.removeClass('hidden');
      $schemaElement.closest('.schema-detail-container')[0].scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }
}

export default { Header, HttpContainer, Sidebar, Schema };
