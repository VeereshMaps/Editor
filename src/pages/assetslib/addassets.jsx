import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Chip, InputAdornment, Paper, Grid } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useDispatch, useSelector } from "react-redux";
import { createAsset, resetState } from "../../redux/Slices/createAssetSlice";
import { useNavigate } from "react-router";
import Notification from "../../components/Notification";


const AddAssets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, success } = useSelector((state) => state.createAsset);
  const loginDetails = useSelector((state) => state.auth);
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [licenceText, setLicenceText] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(false);


  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(()=>{
    setOpen(true);
    console.log("asdasd")
  },[])

  const handleKeywordAdd = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput)) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("licenceText", licenceText);
    formData.append("keywords", JSON.stringify(keywords));
    formData.append("createdBy", loginDetails?.user?._id);
    if (image) formData.append("image", image);

    dispatch(createAsset(formData));
  };

  // Effect to handle success alert and reset form
  useEffect(() => {
    if (success) {
        setOpen(true);
      setName("");
      setLicenceText("");
      setKeywords([]);
      setKeywordInput("");
      setImage(null);
      setPreview(null);
      dispatch(resetState()); // Reset Redux state after success
      navigate(-1);
    }
  }, [success, dispatch]);

  return (
    <Paper sx={{ padding: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Asset Name Field */}
          <Grid item xs={12}>
            <TextField
              label="Asset Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
          </Grid>

          {/* Licence Text Field */}
          <Grid item xs={12}>
            <TextField
              label="Licence Text"
              value={licenceText}
              onChange={(e) => setLicenceText(e.target.value)}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>

          {/* Keywords Field */}
          <Grid item xs={12}>
            <TextField
              label="Keywords"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleKeywordAdd())}
              fullWidth
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={handleKeywordAdd} size="small">
                      Add
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginTop: 1 }}>
              {keywords.map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  onDelete={() => setKeywords(keywords.filter((k) => k !== keyword))}
                />
              ))}
            </Box>
          </Grid>

          {/* Image Upload Field */}
          <Grid item xs={12}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Upload Image
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
            {preview && (
              <Box sx={{ marginTop: 2 }}>
                <img src={preview} alt="Preview" style={{ maxWidth: "100%", borderRadius: 4 }} />
              </Box>
            )}
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ marginTop: 2 }}
            >
              {loading ? "Uploading..." : "Submit"}
            </Button>
          </Grid>

          {/* Error Message */}
          {error && (
            <Grid item xs={12}>
              <Box sx={{ color: "red", textAlign: "center", marginTop: 2 }}>
                {typeof error === "string" ? error : "An error occurred"}
              </Box>
            </Grid>
          )}
        </Grid>
        <Notification open={open} onClose={() => setOpen(false)} message="Asset uploaded successfully!" />
      </Box>
    </Paper>
  );
};

export default AddAssets;
