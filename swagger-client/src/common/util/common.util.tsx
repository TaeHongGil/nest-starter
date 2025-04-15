import NGSMessage from './message.util';

class NGSCommonUtil {
  static copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => NGSMessage.info(`클립보드에 복사되었습니다.`))
      .catch((err) => NGSMessage.error(`복사 실패: ${err}`));
  };
}

export default NGSCommonUtil;
