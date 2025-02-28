import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import DashboardLayout from 'layout/Dashboard';
import { useEffect } from 'react';
import { fetchUserById } from 'redux/Slices/userSlice';

export default function ProtectedRoute() {
    const location = useLocation();
  const {status, isAuthenticated} = useSelector((state) => state.auth);


  // If authentication is still in progress, show a loading state
  if (status === "pending") {
    return <p>Loading...</p>;
  }
console.log("isAuthenticated",isAuthenticated);

//   // Redirect to login if not authenticated
  return isAuthenticated ? <DashboardLayout key={location.pathname} /> : <Navigate to="/login" replace />;
}
