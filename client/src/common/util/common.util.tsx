import MessageUtil from './message.util';

class CommonUtil {
  static copyToClipboard(text: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => MessageUtil.info(`Copied to clipboard.`))
      .catch((err) => MessageUtil.error(`Copy failed: ${err}`));
  }

  static findAllValuesByKey(object: any, target: string): any[] {
    if (!object || typeof object !== 'object') {
      return [];
    }

    const result: any[] = [];

    function traverse(node: any): void {
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

  static calculateTextSize(text: string, fontSize: number): number {
    const span = document.createElement('span');
    span.style.cssText = `font-size: ${fontSize}px; visibility:hidden; white-space:nowrap; position:absolute;`;
    span.textContent = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    span.remove();

    return width;
  }
}

export default CommonUtil;
