import { useEffect } from "react";

type UseModalOptions = {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
};

/**
 * Custom hook for modal behavior:
 * - Press Escape to close (or go back if onBack is provided)
 * - Click outside to close
 */
export function useModal({ isOpen, onClose, onBack }: UseModalOptions) {
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        if (onBack) {
          // If there's a back handler, go back first
          onBack();
        } else {
          // Otherwise, close the modal
          onClose();
        }
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, onBack]);
}
