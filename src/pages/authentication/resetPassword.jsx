import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../redux/Slices/forgotPasswordSlice";

// Material-UI Components
import { Box, TextField, Button, Typography } from "@mui/material";
import AuthCard from "./AuthCard";
import { useNavigate } from "react-router";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword({ email, otp, newPassword })).then(() => {
        setTimeout(() => {
            navigate('/login');    
        }, 1500);
    });
  };

  return (
    <Box 
      sx={{ 
        minHeight: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        bgcolor: "background.default"
      }}
    >
      <AuthCard>
        <Typography variant="h5" align="center" gutterBottom>
          Reset Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter your email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Enter OTP"
            variant="outlined"
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="New Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button 
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Resetting..." : "Reset Password"}
          </Button>
          {status === "passwordReset" && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>
              Password Reset Successfully
            </Typography>
          )}
          {error && (
            <Typography color="error" align="center" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </form>
      </AuthCard>
    </Box>
  );
};

export default ResetPassword;
