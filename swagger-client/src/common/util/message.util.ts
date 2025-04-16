import { ReactNode } from 'react';

/**
 * Context-related utilities (Toast, Modal, etc.)
 */
class MessageUtil {
  static error(message: string, delay = 3000): string {
    // ToastHelper.addToast(message, COLOR_TYPE.DANGER, delay);
    return message;
  }

  static info(message: string, delay = 3000): string {
    // ToastHelper.addToast(message, COLOR_TYPE.INFO, delay);
    return message;
  }

  static success(message: string, delay = 1000): string {
    // ToastHelper.addToast(message, COLOR_TYPE.SUCCESS, delay);
    return message;
  }

  static async dialogAsync(message: string | ReactNode, alert?: string): Promise<boolean | undefined> {
    const option = alert ? { alert } : {};
    return true;
  }

  static loadingDialog(isShow: boolean, element?: Element) {
    // if (isShow) {
    //   LoadingHelper.showLoading(element);
    // } else {
    //   LoadingHelper.hideLoading();
    // }
  }
}

export default MessageUtil;
