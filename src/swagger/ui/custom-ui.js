// 헤더 추가 함수
function addGlobalHeader(key, value) {
  window['globalHeaders'][key] = value;
  updateHeadersDisplay();
}

// 헤더 삭제 함수
function removeGlobalHeader(key) {
  delete window['globalHeaders'][key];
  updateHeadersDisplay();
}

function getEndPoint(node) {
  if (!node) {
    return;
  }
  var info;
  while (node && !info) {
    const path = node.querySelector('.opblock-summary-path');
    const method = node.querySelector('.opblock-summary-method');
    if (path && method) {
      info = {
        method: method.textContent,
        path: path.textContent,
      };
    }
    node = node.parentElement;
  }
  return { node: node, info: info };
}

function changeExample(node, text) {
  if (!node) {
    return;
  }
  if (typeof text == 'object') {
    text = JSON.stringify(text, null, 2);
  }
  const code = document.createElement('code');
  code.className = 'language-json hljs';
  code.innerHTML = hljs.highlight(text, { language: 'json' }).value;

  node.innerHTML = '';
  node.appendChild(code);

  const cancel = node.parentNode.querySelector('.btn.cancel');
  if (cancel) {
    cancel.dispatchEvent(new Event('click'));
  }
}

function updateTokenDisplay(token, time = new Date()) {
  sessionStorage.setItem('userToken', JSON.stringify({ token: token, time: time }));
  const tokenArea = document.getElementById('userToken');
  if (tokenArea) {
    tokenArea.innerText = `Bearer ${token}`;
  }
  const timeLabel = document.getElementById('tokenTime');
  if (timeLabel) {
    timeLabel.textContent = time;
  }
}

function responseSave(url, body) {
  const xhrPost = new XMLHttpRequest();
  xhrPost.open('POST', '/response/save', true);
  xhrPost.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhrPost.send(JSON.stringify({ url: url, body: body }));
  save = sessionStorage.getItem('responseSave') || '{}';
  save = JSON.parse(save);
  save[url] = typeof body == 'object' ? JSON.stringify(body, null, 2) : body;
  sessionStorage.setItem('responseSave', JSON.stringify(save));
}

// 전역 변수 선언
function setDefaultHeader() {
  var header = localStorage.getItem('globalHeaders');
  if (header) {
    header = JSON.parse(header);
    window['globalHeaders'] = header;
  } else if (window['ui'].configs && window['ui'].configs.header) {
    window['globalHeaders'] = window['ui'].configs.header;
  } else {
    window['globalHeaders'] = {};
  }
}

// 헤더 디스플레이 업데이트 함수
function updateHeadersDisplay() {
  const headersContainer = document.getElementById('headersContainer');
  headersContainer.innerHTML = ''; // 기존 내용을 비웁니다.

  for (const [key, value] of Object.entries(window['globalHeaders'])) {
    const headerElement = document.createElement('div');

    headerElement.innerHTML = `
      <div style="flex: 1;">${key}<button onclick="removeGlobalHeader('${key}')" style="background: none; border: none; color: red; cursor: pointer; font-size: 16px; line-height: 1;">&times;</button>
        <textarea id="${key}Input" rows="1" style="min-height: auto;">${value}</textarea>
      </div>
    `;
    headersContainer.appendChild(headerElement);
  }
}

function waitForElement(parent, selector, callback, retry = 0) {
  const element = parent.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    if (retry >= 10) {
      return;
    }
    setTimeout(() => {
      waitForElement(parent, selector, callback, retry + 1);
    }, 50);
  }
}

function setDefaultToken() {
  const userToken = sessionStorage.getItem('userToken');
  var result = window['ui'].configs?.token?.api ? `Please ${window['ui'].configs.token.api}` : 'Not Used';
  if (userToken) {
    result = `Bearer ${JSON.parse(sessionStorage.getItem('userToken')).token}`;
  }
  return result;
}

function setDefaultTime() {
  const userToken = sessionStorage.getItem('userToken');
  var result = '-';
  if (userToken) {
    result = new Date(JSON.parse(sessionStorage.getItem('userToken')).time);
  }
  return result;
}

// 초기화 함수
function initializeHeaders() {
  waitForElement(document, '.info', function (element) {
    const htmlString = `
      <button id="dataResetButton">Data Reset</button>
      <p>
        <h3>Global Header</h3>
        <div id="headersContainer" style="display: flex; flex-wrap: wrap;">
        </div>
        <div>
          Authorization
          <textarea id="userToken" rows="1" style="min-height: auto; white-space: nowrap; overflow-x: scroll;" disabled>
          ${setDefaultToken()}
          </textarea >
          Token Generated Time:
          <label id='tokenTime' style="font-size:15px">${setDefaultTime()}</label>
        </div >
      </p >
      <p>
        <div>
          <input type="text" id="headerKeyInput" placeholder="Header Key">
          <input type="text" id="headerValueInput" placeholder="Header Value">
          <button id="addHeaderButton">Add Header</button>
        </div>
      </p>
    `;
    element.insertAdjacentHTML('beforeend', htmlString);

    // Data Reset 버튼에 클릭 이벤트 추가
    const button = document.getElementById('dataResetButton');
    if (button) {
      button.onclick = function () {
        localStorage.clear();
        sessionStorage.clear();
        location.reload();
      };
    }

    // Add Header 버튼에 클릭 이벤트 추가
    const addHeaderButton = document.getElementById('addHeaderButton');
    if (addHeaderButton) {
      addHeaderButton.onclick = function () {
        const key = document.getElementById('headerKeyInput').value;
        const value = document.getElementById('headerValueInput').value;
        if (key && value) {
          addGlobalHeader(key, value);
          document.getElementById('headerKeyInput').value = '';
          document.getElementById('headerValueInput').value = '';
        }
      };
    }

    setDefaultHeader();
    updateHeadersDisplay();
  });
}

// 문서 로드 시 초기화 실행
window.addEventListener('load', initializeHeaders);

window.addEventListener('message', function (event) {
  updateTokenDisplay(event.data);
});

window.addEventListener('load', async function () {
  sessionStorage.removeItem('responseSave');
  var saveResponseList = [];
  await fetch('/response/list')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      saveResponseList = data;
    })
    .catch((error) => {
      console.error('Error fetching JSON data:', error);
      console.log('Error fetching JSON data. Check the console for more details.');
    });

  const responseData = JSON.parse(localStorage.getItem('responseData')) || {};
  const requestData = JSON.parse(localStorage.getItem('requestData')) || {};
  const spec = JSON.parse(window['ui'].specSelectors.specStr());
  for (const [pathname, methods] of Object.entries(spec.paths)) {
    for (const [method, result] of Object.entries(methods)) {
      const storgeName = `${pathname}_${method}`;
      const saveData = saveResponseList[storgeName.replace('/', '') + '.txt'];
      result.responses['Server Save'] = result.responses['Server Save'] || {};
      result.responses['Server Save'].content = result.responses['Server Save'].content || {};
      result.responses['Server Save'].content['text'] = { example: saveData || '저장된 Response가 없습니다.' };

      // if (responseData[storgeName]) {
      //   const res = responseData[storgeName];
      //   result.responses[res.status] = result.responses[res.status] || {};
      //   result.responses[res.status].content = result.responses[res.status].content || {};
      //   result.responses[res.status].content['application/json'] = { example: res.body };
      // }
      if (requestData[storgeName]) {
        const req = requestData[storgeName];
        let schemaName = result.requestBody?.content['application/json']?.schema?.$ref;
        if (schemaName) {
          schemaName = schemaName.substring(schemaName.lastIndexOf('/') + 1);
          const data = req.body ? JSON.parse(req.body) : {};
          for (const [properties, value] of Object.entries(spec.components.schemas[schemaName].properties)) {
            if (data[properties]) {
              value['example'] = data[properties];
            }
          }
        }
        const parameters = result.parameters;
        for (const data of parameters) {
          const parm = req.parameters[data.name];
          if (parm) {
            data.schema.example = parm;
          }
        }
      }
    }
  }
  window['ui'].specActions.updateJsonSpec(spec);
});

function handleDOMChanges(mutations) {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        node.querySelectorAll('.arrow').forEach((childNode) => {
          var button = childNode.parentNode;
          if (button && button.type == 'submit' && button.getAttribute('aria-expanded') == 'true') {
            button.click();
          }
        });
        node.querySelectorAll('.property').forEach((childNode) => {
          if (childNode.textContent.indexOf('example') > -1) {
            childNode.textContent = '';
          }
        });
        node.querySelectorAll('.opblock-body').forEach((childNode) => {
          waitForElement(childNode, '.opblock-section', () => {
            var section = childNode.querySelector('.opblock-section');
            var execute = childNode.querySelector('.execute-wrapper');
            var group = childNode.querySelector('.btn-group');
            var target = execute ? execute : group;
            if (target) {
              section.appendChild(target);

              var div = document.createElement('div');
              div.classList = 'server-save-checkbox';

              var endpoint = getEndPoint(childNode);
              var endpointInfo = endpoint.info;
              const pathname = `${endpointInfo.path}_${endpointInfo.method}`.toLowerCase();
              var serverSaveCheckbox = document.createElement('input');
              serverSaveCheckbox.type = 'checkbox';
              serverSaveCheckbox.id = `${pathname}_checkbox`;
              serverSaveCheckbox.name = 'server-save';
              var checkboxLabel = document.createElement('label');
              checkboxLabel.htmlFor = `${pathname}_checkbox`;
              checkboxLabel.appendChild(document.createTextNode('Server Save'));

              div.appendChild(serverSaveCheckbox);
              div.appendChild(checkboxLabel);
              target.appendChild(div);
            }
          });
        });
        node.querySelectorAll('.response').forEach((childNode) => {
          if (childNode.getAttribute('data-code')) {
            waitForElement(childNode, 'button[aria-selected="false"]', () => {
              childNode.querySelector('button[aria-selected="false"]')?.click();
            });
          }

          waitForElement(childNode, '.example', () => {
            const example = childNode.querySelector('.example');
            if (example) {
              const copyDiv = document.createElement('div');
              copyDiv.className = 'copy-to-clipboard swagger-ui';
              const copyButton = document.createElement('button');
              copyButton.onclick = async function () {
                await navigator.clipboard.writeText(example.parentNode.textContent);
              };
              copyDiv.appendChild(copyButton);
              example.appendChild(copyDiv);
            }
          });

          waitForElement(childNode, '.example.microlight', () => {
            const status = childNode.querySelector('.response-col_status');
            if (status && status.textContent == 'Server Save') {
              var endpoint = getEndPoint(childNode);
              var endpointInfo = endpoint.info;
              const pathname = `${endpointInfo.path}_${endpointInfo.method}`.toLowerCase();
              const exampleNode = childNode.querySelector('.example.microlight');
              exampleNode.id = `${pathname}_example`;
              save = sessionStorage.getItem('responseSave');
              if (save) {
                save = JSON.parse(save);
                exampleNode.textContent = save[pathname] || exampleNode.textContent;
              }
              changeExample(exampleNode, exampleNode.textContent);

              const button = document.createElement('button');
              button.className = 'btn edit';
              button.textContent = 'EDIT';
              button.isEdit = false;
              button.onclick = async function (e) {
                if (e.target.isEdit) {
                  return;
                }
                e.target.isEdit = true;
                const responseText = exampleNode ? exampleNode.textContent : 'Example Value not found';
                if (exampleNode) {
                  exampleNode.style.display = 'none';
                  const editContainer = document.createElement('div');
                  editContainer.className = 'edit-container';

                  const textarea = document.createElement('textarea');
                  textarea.value = responseText;
                  textarea.style.width = '100%';
                  textarea.style.height = '150px';

                  const buttonContainer = document.createElement('div');
                  buttonContainer.className = 'button-container';

                  const saveButton = document.createElement('button');
                  saveButton.className = 'btn save';
                  saveButton.textContent = 'Save';
                  saveButton.onclick = function () {
                    changeExample(exampleNode, textarea.value);
                    responseSave(pathname, textarea.value);
                  };

                  const cancelButton = document.createElement('button');
                  cancelButton.textContent = 'Cancel';
                  cancelButton.className = 'btn cancel';
                  cancelButton.onclick = function () {
                    e.target.isEdit = false;
                    exampleNode.style.display = 'block';
                    editContainer.remove();
                  };

                  buttonContainer.appendChild(saveButton);
                  buttonContainer.appendChild(cancelButton);
                  editContainer.appendChild(textarea);
                  editContainer.appendChild(buttonContainer);

                  exampleNode.parentNode.insertBefore(editContainer, exampleNode.nextSibling);
                }
              };
              status.appendChild(button);
            }
          });
        });
      }
    });
  });
}

function initializeObserver() {
  const observer = new MutationObserver(handleDOMChanges);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

initializeObserver();
