import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/authentication/login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/register')));
const ForgotPassword = Loadable(lazy(() => import('pages/authentication/forgotPassword')));
const VerifyOtp = Loadable(lazy(() => import('pages/authentication/verifyOtp')));
const ResetPassword = Loadable(lazy(() => import('pages/authentication/resetPassword')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/forgot-password',
      element: <ForgotPassword />
    },
    {
        path:"/verify-otp",
        element:<VerifyOtp />
    },
    {
        path:"/reset-password",
        element:<ResetPassword />
    }
  ]
};

export default LoginRoutes;
