// material-ui
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// project import
import NavGroup from "./NavGroup";
import { useSelector } from "react-redux";
import getMenuItems from "menu-items"; // Ensure it's a function now

export default function Navigation() {
  const auth = useSelector((state) => state?.auth); // Get Redux state
  const userRole = auth?.user?.role;

  // Ensure menuItems is defined
  const menuItem = getMenuItems(userRole); // Call function to get menu items
  const menuItems = menuItem?.items ?? []; // Fallback to empty array

  // Prevent errors by handling undefined cases
  if (!menuItems.length) {
    return <Typography variant="h6" align="center">No menu items available</Typography>;
  }

  const navGroups = menuItems.map((item) => {
    if (item.type === "group") {
      return <NavGroup key={item.id} item={item} />;
    }
    return (
      <Typography key={item.id} variant="h6" color="error" align="center">
        Fix - Navigation Group
      </Typography>
    );
  });

  return <Box sx={{ pt: 2 }}>{navGroups}</Box>;
}
