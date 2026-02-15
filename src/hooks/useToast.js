import { toast as sonnerToast } from 'sonner';

// Custom toast wrapper with consistent styling
export const toast = {
    success: (message, options = {}) => {
        return sonnerToast.success(message, {
            ...options,
        });
    },

    error: (message, options = {}) => {
        return sonnerToast.error(message, {
            ...options,
        });
    },

    warning: (message, options = {}) => {
        return sonnerToast.warning(message, {
            ...options,
        });
    },

    info: (message, options = {}) => {
        return sonnerToast.info(message, {
            ...options,
        });
    },

    promise: (promise, messages) => {
        return sonnerToast.promise(promise, messages);
    },
};

export default toast;
