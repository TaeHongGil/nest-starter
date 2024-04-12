window.addEventListener('load', function () {
  const responseData = JSON.parse(localStorage.getItem('responseData')) || {};
  const requestData = JSON.parse(localStorage.getItem('requestData')) || {};
  const spec = JSON.parse(window['ui'].specSelectors.specStr());
  for (const [pathname, methods] of Object.entries(spec.paths)) {
    for (const [method] of Object.entries(methods)) {
      const storgeName = `${pathname}_${method}`;
      // data load
      if (responseData[storgeName]) {
        const res = responseData[storgeName];
        spec.paths[pathname][method].responses[res.status] = spec.paths[pathname][method].responses[res.status] || {};
        spec.paths[pathname][method].responses[res.status].content = spec.paths[pathname][method].responses[res.status].content || {};
        spec.paths[pathname][method].responses[res.status].content['application/json'] = { example: res.body };
      }
      if (requestData[storgeName]) {
        const req = requestData[storgeName];
        let schemaName = spec?.paths[pathname]?.[method]?.requestBody?.content['application/json']?.schema?.$ref;
        if (schemaName) {
          schemaName = schemaName.substring(schemaName.lastIndexOf('/') + 1);
          const data = req.body ? JSON.parse(req.body) : {};
          for (const [properties, value] of Object.entries(spec.components.schemas[schemaName].properties)) {
            if (data[properties]) {
              value['example'] = data[properties];
            }
          }
        }
        const parameters = spec?.paths[pathname]?.[method]?.parameters;
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
            newButton.onclick = async function () {
              await navigator.clipboard.writeText(childNode.parentNode.textContent);
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
    setTimeout(() => {
      waitForElement(selector, callback);
    }, 100);
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
