//@ sourceURL=swagger.common

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
