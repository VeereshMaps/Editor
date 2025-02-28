import dashboard from "./dashboard";
import pages from "./page";
import utilities from "./utilities";

const getMenuItems = (role) => ({
  items: [dashboard, ...(role === "Admin" ? [pages] : []), utilities],
});

export default getMenuItems;
