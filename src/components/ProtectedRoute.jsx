import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import DashboardLayout from 'layout/Dashboard';

export default function ProtectedRoute() {
  const {status, isAuthenticated} = useSelector((state) => state.auth);

  // If authentication is still in progress, show a loading state
  if (status === "pending") {
    return <p>Loading...</p>;
  }
console.log("isAuthenticated",isAuthenticated);

//   // Redirect to login if not authenticated
  return isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />;
}
