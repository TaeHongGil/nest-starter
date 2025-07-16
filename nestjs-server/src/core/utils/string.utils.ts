import lodash from 'lodash';

class StringUtil {
  static toSnakeCase(str: string): string {
    return lodash.snakeCase(str);
  }

  static toCamelCase(str: string): string {
    return lodash.camelCase(str);
  }

  static toCapitalizedCamelCase(str: string): string {
    return lodash.upperFirst(lodash.camelCase(str));
  }

  /**
   * URL에서 특정 쿼리 파라미터 값만 추출
   * @param url 전체 URL
   * @param key 추출할 파라미터명
   * @returns 값(없으면 undefined)
   */
  static getQueryParam(url: string, key: string): string | undefined {
    try {
      const _url = new URL(url);
      const params = _url.searchParams.get(key);

      return params || undefined;
    } catch {
      return undefined;
    }
  }
}

export default StringUtil;
