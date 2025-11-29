import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useEditor } from '../context/EditorContext';
import { useToast } from '../context/ToastContext';

/**
 * Hook to show toast notifications when placement is invalid
 * Detects when invalidPlacementReason changes and shows appropriate toast
 */
export const useInvalidPlacementToast = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { invalidPlacementReason } = useEditor();
  const lastReasonRef = useRef(null);
  const lastToastTimeRef = useRef(0);

  useEffect(() => {
    // Only show toast if reason changed and it's not null
    if (invalidPlacementReason && invalidPlacementReason !== lastReasonRef.current) {
      const now = Date.now();
      // Throttle toasts to once per 1 second to avoid excessive updates
      if (now - lastToastTimeRef.current > 1000) {
        const message = t(`placement.errors.${invalidPlacementReason}`, t('placement.errors.invalid'));
        showToast(message, 'error', 2500);
        lastToastTimeRef.current = now;
      }
      lastReasonRef.current = invalidPlacementReason;
    } else if (!invalidPlacementReason) {
      // Reset when placement becomes valid
      lastReasonRef.current = null;
    }
  }, [invalidPlacementReason, showToast, t]);
};

