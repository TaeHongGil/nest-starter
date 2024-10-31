import lodash from 'lodash';

export class StringUtil {
  static toSnakeCase(str: string): string {
    return lodash.snakeCase(str);
  }

  static toCamelCase(str: string): string {
    return lodash.camelCase(str);
  }
}

export default StringUtil;
