import dashboard from './dashboard';
import pages from './page';
import utilities from './utilities';
import publishing from './selfPublish';

const allowedGoldRoles = ['Admin', 'projectManager','Project Manager', 'editor'];

const getMenuItems = (role) => {
  const filteredUtilities = {
    ...utilities,
    children: utilities.children.filter((item) => {
      if (item.id === 'gold') {
        return allowedGoldRoles.includes(role);
      }
      return true;
    })
  };

  // Build the menu based on role
  const items = [
    ...(role === 'Admin' ? [pages, publishing] : []),
    filteredUtilities,
    dashboard
  ];

  return { items };
};

export default getMenuItems;
