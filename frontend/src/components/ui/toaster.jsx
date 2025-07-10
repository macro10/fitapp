import { useToast } from "../../hooks/use-toast"
import { cn } from "../../lib/utils"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, className, ...props }) {
        return (
          <Toast key={id} className={cn("group", className)} {...props}>
            <div className="grid gap-1">
              {title && (
                <ToastTitle className="group-[.success]:text-green-900 group-[.warning]:text-yellow-900">
                  {title}
                </ToastTitle>
              )}
              {description && (
                <ToastDescription className="group-[.success]:text-green-800/90 group-[.warning]:text-yellow-800/90">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action && <div className="mt-2">{action}</div>}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
