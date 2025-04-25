import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import Dashboard from 'layout/Dashboard';
import ProjectManager from 'pages/users/projectmanager/projectmanager';
import Authors from 'pages/users/authors/authors';
import TeamLead from 'pages/users/teamlead/teamlead';
import TeamMember from 'pages/users/teammember/teammember';
import AuthorForm from 'pages/users/authors/addauthors';
import AddProjectManagerForm from 'pages/users/projectmanager/addprojectmanager';
import AddTeamLeadForm from 'pages/users/teamlead/addteamlead';
import AddTeamMember from 'pages/users/teammember/addteammember';
import AssetsLibrary from 'pages/assetslib/assetslib';
import ProjectsRepo from 'pages/projects/projects';
import AddProjectForm from 'pages/projects/addproject';
import ViewBook from 'pages/projects/viewproject';
import GoldRepo from 'pages/goldrepo/projects';
import ViewGoldBook from 'pages/goldrepo/viewproject';
import EditionDetails from 'pages/projects/editiondetails';
import PublishBook from 'pages/selfPublishing/publish-book';
import ProtectedRoute from 'components/ProtectedRoute';
import DashboardLayout from 'layout/Dashboard';
import AssetForm from "pages/assetslib/addassets"

const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/index')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute />,
  children: [
    {
      path: '/dashboard',
      element: <DashboardDefault />
    },
    // {
    //   path: 'color',
    //   element: <Color />
    // },
    {
      path: 'users',
      children: [
        {
          path: 'authors',
          element: <Authors />
        },
        {
          path: 'add-author',
          element: <AuthorForm />,

        },
        {
          path: 'pm',
          element: <ProjectManager />
        },
        {
          path: 'add-manager',
          element: <AddProjectManagerForm />
        },
        {
          path: 'tl',
          element: <TeamLead />
        },
        {
          path: 'add-teamlead',
          element: <AddTeamLeadForm />
        },
        {
          path: 'pr',
          element: <TeamMember />
        },
        {
          path: 'add-reader',
          element: <AddTeamMember />
        }
      ]
    },
    {
      path: 'assetslibrary',
      element: <AssetsLibrary />
    },
    {
        path: 'add-assets',
        element: <AssetForm />
    },
    {
      path: 'projects',
      children: [
        {
          path: '',
          element: <ProjectsRepo />
        },
        {
          path: 'add',
          element: <AddProjectForm />
        },
        {
          path: 'view',
          element: <ViewBook />
        },
        {
          path: 'edit',
          element: <AddProjectForm />
        }, {
          path: 'editions/:editionId/:projectId',
          element: <EditionDetails />
        },
      ]
    },
    {
      path: 'goldprojects',
      children: [
        {
          path: '',
          element: <GoldRepo />
        },
        {
          path: 'add',
          element: <AddProjectForm />
        },
        {
          path: 'view',
          element: <ViewGoldBook />
        },
        {
          path: 'edit',
          element: <AddProjectForm />
        },
      ]
    },
    {
        path: 'selfPublishing',
        children: [
          {
            path: 'publish-book',
            element: <PublishBook />
          }
        ]
      }
      

    // {
    //   path: 'shadow',
    //   element: <Shadow />
    // },
    // {
    //   path: 'typography',
    //   element: <Typography />
    // }
  ]
};

export default MainRoutes;
