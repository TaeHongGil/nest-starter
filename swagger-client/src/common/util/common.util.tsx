import MessageUtil from './message.util';

class CommonUtil {
  static copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => MessageUtil.info(`Copied to clipboard.`))
      .catch((err) => MessageUtil.error(`Copy failed: ${err}`));
  };

  static findAllValuesByKey(object: any, target: string): any[] {
    const result: any[] = [];

    function traverse(node: any) {
      if (Array.isArray(node)) {
        node.forEach(traverse);
      } else if (node !== null && typeof node === 'object') {
        Object.entries(node).forEach(([key, value]) => {
          if (key === target) {
            result.push(value);
          }
          traverse(value);
        });
      }
    }
    traverse(object);
    return result;
  }
}

export default CommonUtil;
