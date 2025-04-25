import dashboard from "./dashboard";
import pages from "./page";
import utilities from "./utilities";
import publishing from "./selfPublish";

const getMenuItems = (role) => ({
  items: [dashboard, ...(role === "Admin" ? [pages,publishing] : []), utilities],
});

export default getMenuItems;
