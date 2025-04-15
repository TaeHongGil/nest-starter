import NGSMessage from './message.util';

class NGSCommonUtil {
  static copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => NGSMessage.info(`Copied to clipboard.`))
      .catch((err) => NGSMessage.error(`Copy failed: ${err}`));
  };
}

export default NGSCommonUtil;
