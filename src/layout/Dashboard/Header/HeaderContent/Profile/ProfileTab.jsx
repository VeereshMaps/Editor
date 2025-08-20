import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  List, ListItemButton, ListItemIcon, ListItemText,
  Dialog, DialogTitle, DialogContent, Typography, Grid,
  Button, IconButton, TextField, DialogActions,
  InputAdornment
} from '@mui/material';

import EditOutlined from '@ant-design/icons/EditOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { useSelector, useDispatch } from 'react-redux';
import AlertService from 'utils/AlertService';
import { clearResetPasswordState, resetPassword } from 'redux/Slices/resetPassword';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function ProfileTab({ handleLogout }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userDetailsById?.user);
  const resetPasswords = useSelector((state) => state.resetPassword);

  const [selectedTab, setSelectedTab] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleTabClick = (key) => {
    setSelectedTab(key);
    if (key === 'resetPassword') setResetOpen(true);
    if (key === 'viewProfile') setViewOpen(true);
  };

  const handleResetClose = () => {
    dispatch(clearResetPasswordState())
    setResetOpen(false);
    setOldPassword('');
    setNewPassword('');
    setResetError('');
  };

  const handleViewClose = () => setViewOpen(false);

  const handleResetSubmit = async () => {
    setLoading(true);
    setResetError('');
    try {
      const response = await dispatch(resetPassword({
        oldPassword,
        newPassword,
        userId: user._id
      }));
      console.log(response);

      // if (!response.payload.message=== 'Rejected') {
      //   AlertService.error(response.payload?.message);
      //   setResetError(response.payload?.message);
      // } else {
      //   AlertService.success('Password reset successfully.');
      //   handleResetClose();
      // }
    } catch {
      // AlertService.error('Something went wrong. Please try again later.');
      // setResetError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (resetPasswords.status === 'succeeded') {
      AlertService.success(resetPasswords.data?.message || 'Password reset successfully.');
      handleResetClose();
    } else if (resetPasswords.status === 'failed') {
      AlertService.error(resetPasswords.error || 'Failed to reset password.');
      setResetError(resetPasswords.error || 'Failed to reset password.');
    }
  }, [resetPasswords.status === 'succeeded', resetPasswords.status === 'failed']);

  if (!user) return null;

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton selected={selectedTab === 'viewProfile'} onClick={() => handleTabClick('viewProfile')}>
          <ListItemIcon><UserOutlined /></ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>

        <ListItemButton selected={selectedTab === 'resetPassword'} onClick={() => handleTabClick('resetPassword')}>
          <ListItemIcon><EditOutlined /></ListItemIcon>
          <ListItemText primary="Reset Password" />
        </ListItemButton>

        <ListItemButton selected={selectedTab === 'logout'} onClick={handleLogout}>
          <ListItemIcon><LogoutOutlined /></ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>

      {/* View Profile Dialog */}
      <Dialog open={viewOpen} onClose={handleViewClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">User Profile</Typography>
          <IconButton onClick={handleViewClose}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, backgroundColor: '#fff' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle2">First Name</Typography>
              <Typography>{user.firstName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Last Name</Typography>
              <Typography>{user.lastName}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Email</Typography>
              <Typography>{user.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Role</Typography>
              <Typography>{user.role}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2">Country</Typography>
              <Typography>{user.country}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Status</Typography>
              <Typography color={user.active ? 'success.main' : 'error.main'}>
                {user.active ? 'Active' : 'Inactive'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetOpen} onClose={handleResetClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Reset Password</Typography>
          <IconButton onClick={handleResetClose}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {resetError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {resetError}
            </Typography>
          )}

          {/* Old Password */}
          <TextField
            label="Old Password"
            type={showOldPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    edge="end"
                  >
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* New Password */}
          <TextField
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleResetClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResetSubmit}
            disabled={!oldPassword || !newPassword || loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProfileTab.propTypes = {
  handleLogout: PropTypes.func.isRequired
};
