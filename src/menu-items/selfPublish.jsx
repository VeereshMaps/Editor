// assets
import { LoginOutlined, ProfileOutlined, UserOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  UserOutlined
};

const publishing = {
    id: 'selfPublishing',
    title: 'Self-Publishing',
    type: 'group',
    children: [
        // {
        //     id: 'publish-book',
        //     title: 'Publish Book',
        //     type: 'item',
        //     url: '/selfPublishing/publish-book',
        //     icon: icons.UserOutlined,
        // },
        {
            id: 'maponix',
            title: 'Maponix',
            type: 'item',
            url: 'https://maponix.com/#/Signin',
            icon: icons.UserOutlined,
        },
    ],
};

export default publishing;