import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../../redux/Slices/forgotPasswordSlice";

// Material-UI Components
import { Box, TextField, Button, Typography } from "@mui/material";
import AuthCard from "./AuthCard";
import { useNavigate } from "react-router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.forgotPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(sendOtp(email)).then(() => {
        setTimeout(() => {
            navigate('/verify-otp');    
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
          Forgot Password
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
          <Button 
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Sending..." : "Send OTP"}
          </Button>
          {status === "otpSent" && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>
              OTP sent to your email
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

export default ForgotPassword;
