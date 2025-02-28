import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../../redux/Slices/forgotPasswordSlice";

// Material-UI Components
import { Box, TextField, Button, Typography } from "@mui/material";
import AuthCard from "./AuthCard";
import { useNavigate } from "react-router";

const VerifyOtp = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(verifyOtp({ email, otp })).then(() => {
        setTimeout(() => {
            navigate('/reset-password');    
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
          Verify OTP
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
          <Button 
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Verifying..." : "Verify OTP"}
          </Button>
          {status === "otpVerified" && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>
              OTP Verified Successfully
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

export default VerifyOtp;
