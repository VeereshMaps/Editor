import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/Slices/authSlice";

const useAuthCheck = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const { exp } = JSON.parse(atob(token.split(".")[1])); // Decode JWT
        if (Date.now() >= exp * 1000) {
          console.log("Token expired on page load. Logging out...");
          dispatch(logout());
        }
      } catch (error) {
        console.error("Invalid token format. Logging out...");
        dispatch(logout());
      }
    }
  }, []);
};

export default useAuthCheck;
