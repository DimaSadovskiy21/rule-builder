import { memo, type FC, type PropsWithChildren } from "react";

// ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type TDialogProps = PropsWithChildren & {
  open: boolean;
  title: string;
  subtitle: string;
  onClose: () => void;
};

const CustomDialog: FC<TDialogProps> = (props) => {
  const { open, title, subtitle, onClose, children } = props;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{subtitle}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default memo(CustomDialog);
