// assets
import { LoginOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  UserOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'users',
  title: 'Users',
  type: 'group',
  children: [
    // {
    //   id: 'login1',
    //   title: 'Login',
    //   type: 'item',
    //   url: '/login',
    //   icon: icons.LoginOutlined,
    //   target: true
    // },
    // {
    //   id: 'register1',
    //   title: 'Register',
    //   type: 'item',
    //   url: '/register',
    //   icon: icons.ProfileOutlined,
    //   target: true
    // }
    {
      id: 'authors',
      title: 'Authors',
      type: 'item',
      url: '/users/authors',
      icon: icons.UserOutlined,
      // breadcrumbs: false
    },
    {
      id: 'projectmanager',
      title: 'Project Manager',
      type: 'item',
      url: '/users/pm',
      icon: icons.UserOutlined,
      // breadcrumbs: false
    },
    {
      id: 'teamlead',
      title: 'Team Lead',
      type: 'item',
      url: '/users/tl',
      icon: icons.UserOutlined,
      // breadcrumbs: false
    },
    {
      id: 'ProofReader',
      title: 'Team Members',
      type: 'item',
      url: '/users/pr',
      icon: icons.UserOutlined,
      // breadcrumbs: false
    }

  ]
};

export default pages;
