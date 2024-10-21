//@ sourceURL=common.js

function httpRequest(data = {}) {
  return $.ajax({
    url: data.url,
    method: data.method,
    headers: data.headers,
    data: data.body,
    contentType: data.contentType || 'application/json',
  });
}

/**
 * 주어진 URL에서 JSON 데이터를 로드하는 함수
 * @param {string} url - JSON 데이터를 로드할 URL
 * @returns {Promise} - AJAX 요청 결과를 반환하는 Promise
 */
function loadJSON(url) {
  return $.ajax({
    url: url,
    dataType: 'json',
  })
    .done(function (response) {
      console.log('Success:', response);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error('Error:', textStatus, errorThrown);
    });
}

/**
 * 특수 문자가 포함된 ID를 안전하게 선택하는 함수
 * @param {string} id - 선택할 요소의 ID
 * @returns {jQuery} - 선택된 jQuery 객체
 */
function safeSelect(id) {
  return $(`[id="${id}"]`);
}

/**
 * 로딩 오버레이를 표시하는 함수
 */
function showLoading() {
  $('#loading-overlay').removeClass('hidden');
}

/**
 * 로딩 오버레이를 숨기는 함수
 */
function hideLoading() {
  $('#loading-overlay').addClass('hidden');
}
