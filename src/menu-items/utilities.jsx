// assets
import {
  AppstoreAddOutlined,
  AntDesignOutlined,
  BarcodeOutlined,
  BgColorsOutlined,
  FontSizeOutlined,
  LoadingOutlined,
  FileImageOutlined,
  CloudSyncOutlined
} from '@ant-design/icons';

// icons
const icons = {
  FontSizeOutlined,
  BgColorsOutlined,
  BarcodeOutlined,
  AntDesignOutlined,
  LoadingOutlined,
  AppstoreAddOutlined,
  FileImageOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'repo',
  title: 'Repo',
  type: 'group',
  children: [
    {
      id: 'wip',
      title: 'Projects',
      type: 'item',
      url: '/projects',
      icon: CloudSyncOutlined
    },
    {
      id: 'gold',
      title: 'GOLD',
      type: 'item',
      url: '/goldprojects',
      icon: CloudSyncOutlined
    },
    {
      id: 'assets',
      title: 'Assets',
      type: 'item',
      url: '/assetslibrary',
      icon: icons.FileImageOutlined,

    }
  ]
};

export default utilities;
