//@ sourceURL=swagger.common
/**
 * 특수 문자가 포함된 ID를 안전하게 선택하는 함수
 * @param {string} id - 선택할 요소의 ID
 * @returns {jQuery} - 선택된 jQuery 객체
 */
function safeSelect(id) {
  return $(`[id="${id}"]`);
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
 * 특정 요소의 표시/숨김을 토글하는 함수
 * @param {string} id - 토글할 요소의 ID
 */
function toggleHidden(id) {
  safeSelect(id).toggleClass('hidden');
}

/**
 * element 텍스트를 클립보드에 복사하는 함수
 * @param {jQuery} $element - 복사할 텍스트가 있는 jQuery 요소
 */
async function copyCode($element) {
  try {
    await navigator.clipboard.writeText($element.text());
  } catch (err) {
    console.error('copy error', err);
  }
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

/**
 * 모든 토글 컴포넌트를 접는 함수
 */
function collapseAll() {
  $('.toggle-component').addClass('hidden');
}

function initSwaggerStorage() {
  window.swaggerStorge = JSON.parse(localStorage.getItem('swaggerStorge') || '{}');
  window.addEventListener('beforeunload', (event) => {
    localStorage.setItem('swaggerStorge', JSON.stringify(window.swaggerStorge));
  });
}
