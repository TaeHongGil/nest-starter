import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField } from '@mui/material';
import React, { createContext, ReactNode, useState } from 'react';

interface DialogContextProps {
  showDialog: (title: string, content: string | ReactNode, onConfirm?: () => void, onCancel?: () => void) => void;
  showFormDialog: (title: string, initialData: Record<string, string>, onConfirm: (data: Record<string, string>) => void, onCancel?: () => void) => void;
}

const DialogContext = createContext<DialogContextProps>({
  showDialog: () => {},
  showFormDialog: () => {},
});

export class DialogHelper {
  static showDialog: (title: string, content: string | ReactNode) => Promise<boolean> = async () => false;
  static showFormDialog: (title: string, initialData: Record<string, string>) => Promise<Record<string, string> | undefined> = async () => undefined;
}

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogContent, setDialogContent] = useState<string | ReactNode>('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isFormDialog, setIsFormDialog] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: any) => void) | undefined>(undefined);

  const showDialog = async (title: string, content: string | ReactNode): Promise<boolean> => {
    setDialogTitle(title);
    setDialogContent(content);
    setIsFormDialog(false);
    setOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const showFormDialog = async (title: string, initialData: Record<string, string>): Promise<Record<string, string> | undefined> => {
    setDialogTitle(title);
    setFormData(initialData);
    setIsFormDialog(true);
    setOpen(true);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const closeDialog = (): void => {
    setOpen(false);
    setDialogTitle('');
    setDialogContent('');
    setFormData({});
    setResolvePromise(undefined);
  };

  const handleConfirm = (): void => {
    if (isFormDialog) {
      resolvePromise?.(formData);
      console.log(formData);
    } else {
      resolvePromise?.(true);
    }
    closeDialog();
  };

  const handleCancel = (): void => {
    resolvePromise?.(isFormDialog ? undefined : false);
    closeDialog();
  };

  const handleInputChange = (key: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    DialogHelper.showDialog = showDialog;
    DialogHelper.showFormDialog = showFormDialog;
  }, []);

  return (
    <DialogContext.Provider value={{ showDialog, showFormDialog }}>
      {children}
      <Dialog fullWidth maxWidth={'md'} open={open} onClose={handleCancel} aria-hidden={!open}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <Divider />
        <DialogContent>
          {isFormDialog ? (
            <Grid container spacing={2}>
              {Object.entries(formData).map(([key, value]) => (
                <Grid size={12} key={key}>
                  <TextField fullWidth label={key} value={value} onChange={(e) => handleInputChange(key, e.target.value)} />
                </Grid>
              ))}
            </Grid>
          ) : (
            dialogContent
          )}
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={handleCancel} color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </DialogContext.Provider>
  );
};
