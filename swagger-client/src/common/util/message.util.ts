import { DialogHelper } from '@root/components/context/Dialog.context';
import { LoadingHelper } from '@root/components/context/Loading.context';
import { ToastHelper } from '@root/components/context/Toast.context';
import { ReactNode } from 'react';

/**
 * Context-related utilities (Toast, Modal, etc.)
 */
class MessageUtil {
  static error(message: string, delay = 3000): string {
    ToastHelper.addToast(message, 'error', delay);
    return message;
  }

  static info(message: string, delay = 3000): string {
    ToastHelper.addToast(message, 'info', delay);
    return message;
  }

  static success(message: string, delay = 2000): string {
    ToastHelper.addToast(message, 'success', delay);
    return message;
  }

  static async dialogAsync(title: string, message: string | ReactNode): Promise<boolean | undefined> {
    const result = await DialogHelper.showDialog(title, message);
    return result;
  }

  static async formDialogAsync(title: string, initialData: Record<string, string>): Promise<Record<string, string> | undefined> {
    const result = await DialogHelper.showFormDialog(title, initialData);
    return result;
  }

  static loadingProgress(isShow: boolean) {
    if (isShow) {
      LoadingHelper.showLoading();
    } else {
      LoadingHelper.hideLoading();
    }
  }
}

export default MessageUtil;
