import { RouterProvider } from "react-router-dom";
import { Suspense, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

// Project imports
import router from "routes";
import ThemeCustomization from "themes";
import ScrollTop from "components/ScrollTop";
import { fetchUserById } from "redux/Slices/userSlice";
import { setAuthState } from "redux/Slices/authSlice"; // Import action to update state
import useAuthCheck from "./api/hooks/useAuthCheck"; // Import the hook

export default function App() {
  const dispatch = useDispatch();
  const userDetails = useSelector((state) => state.auth);

  // Call the auth check hook at the beginning of the component
  useAuthCheck();

  // Memoized function to fetch user details
  const fetchUserDetailsById = useCallback((userData) => {
    const userId = userData?._id;
    if (userId) {
      try {
        dispatch(fetchUserById(userId));
      } catch (error) {
        console.log("Error fetching UserDetails:", error);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (userDetails?.user && userDetails?.isAuthenticated) {
        fetchUserDetailsById(userDetails.user);
    } else {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            // Ensure we dispatch only if Redux doesn't already have this user
            if (!userDetails?.user || userDetails?.user?._id !== parsedUser._id) {
                dispatch(setAuthState({ user: parsedUser }));
            }
        }
    }
  }, [userDetails]); // Include dispatch in dependencies

  return (
    <ThemeCustomization>
      <ScrollTop>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </ScrollTop>
    </ThemeCustomization>
  );
}
