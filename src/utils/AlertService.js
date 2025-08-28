import { toast } from 'react-toastify';

const defaultOptions = {
  position:"top-center",
  autoClose: 1000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const AlertService = {
  success: (message, options = {}) => {
    toast.success(message, { ...defaultOptions, ...options });
  },

  error: (message, options = {}) => {
    toast.error(message, { ...defaultOptions, ...options });
  },

  info: (message, options = {}) => {
    toast.info(message, { ...defaultOptions, ...options });
  },

  warn: (message, options = {}) => {
    toast.warn(message, { ...defaultOptions, ...options });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, { ...defaultOptions, ...options });
  },

  update: (toastId, newState) => {
    toast.update(toastId, {
      ...defaultOptions,
      ...newState,
    });
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  clearAll: () => {
    toast.dismiss();
  },
};

export default AlertService;
