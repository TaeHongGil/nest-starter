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
}

export default StringUtil;
