//@ sourceURL=swagger.util
class SwaggerUtil {
  /**
   * 주어진 참조(ref)를 해석하여 경로와 데이터를 반환
   * @param {string} ref - JSON 스키마의 참조 경로
   * @returns {Object} - 참조된 스키마의 이름와 데이터를 포함한 객체
   */
  static resolveRef(ref) {
    const refPath = ref.replace(/^#\/components\/schemas\//, '');
    return {
      name: refPath,
      data: window.spec.components.schemas[refPath],
    };
  }
}

export default SwaggerUtil;
