import React, { useState, useEffect } from "react";
import {
    TextField,
    Button,
    Box,
    Chip,
    InputAdornment,
    Paper,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Modal, Typography, CircularProgress,
    IconButton,
    ListSubheader
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch, useSelector } from "react-redux";
import { createAsset, resetState } from "../../redux/Slices/createAssetSlice";
import { useNavigate } from "react-router";
import Notification from "../../components/Notification";
import axiosInstance from "api/axiosInstance";

const LICENSE_OPTIONS = [
    { value: "CC0", label: "CC0 - Free to use without attribution" },
    { value: "CC BY", label: "CC BY - Use allowed with credit to the creator" },
    { value: "CC BY-SA", label: "CC BY-SA - Share and adapt with credit, same license" },
    { value: "CC BY-ND", label: "CC BY-ND - Use with credit, no changes allowed" },
    { value: "CC BY-NC", label: "CC BY-NC - Non-commercial use only with credit" },
    { value: "CC BY-NC-SA", label: "CC BY-NC-SA - Non-commercial, share alike, credit" },
    { value: "CC BY-NC-ND", label: "CC BY-NC-ND - Non-commercial, no changes, credit" },
];

const AddAssets = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success } = useSelector((state) => state.createAsset);
    const loginDetails = useSelector((state) => state.auth);
    const [localError, setLocalError] = useState("");
    const [name, setName] = useState("");
    const [keywords, setKeywords] = useState([]);
    const [keywordInput, setKeywordInput] = useState("");
    const [licenceType, setLicenceType] = useState("");
    const [licenceText, setLicenceText] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [open, setOpen] = useState(false);
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiDescription, setAiDescription] = useState("");
    const [artisticStyle, setArtisticStyle] = useState("");
    const [photoStyle, setPhotoStyle] = useState("");
    const [useCaseStyle, setUseCaseStyle] = useState("");

    const [generatedImages, setGeneratedImages] = useState([]);
    const [loadingAI, setLoadingAI] = useState(false);
    const [loadingKeyword, setLoadingKeyword] = useState(false);

    const styles = [
        {
            category: "By Artistic Style",
            values: [
                "Sketch",
                "Line Art",
                "Watercolor",
                "Oil Painting",
                "Charcoal Drawing",
                "Digital Art",
                "Pixel Art"
            ]
        },
        {
            category: "By Photography Style",
            values: [
                "Portrait",
                "Landscape",
                "Macro",
                "Black & White",
                "HDR",
                "Candid",
                "Street Photography"
            ]
        },
        {
            category: "By Use Case or Medium",
            values: [
                "Concept Art",
                "Comics / Manga Panels",
                "Emojis / Stickers",
                "Memes",
                "Icons / Flat Design"
            ]
        }
    ];



    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setLocalError("");
        }
    };

    useEffect(() => {
        setOpen(true);
    }, []);

    const handleGenerateKeywords = async () => {
        setKeywords([]);
        if (!image) {
            setKeywords([]);
            return setLocalError("Please upload an image first");
        }

        const formData = new FormData();
        formData.append("image", image); // assuming 'image' is from file picker

        try {
            setLoadingKeyword(true);
            const response = await axiosInstance.post("/api/generate-keywords", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const aiKeywords = response.data.keywords
                // Remove the intro text (case-insensitive, handles optional spaces)
                .replace(/^[^\w\s]*Here are some relevant keywords for the image[:\s]*[\r\n]*/i, "")
                .split(/[,.\n]/) // split by comma, period, or newline
                .map(k => k.trim()) // trim spaces
                .map(k => k.replace(/^[\d\-–•]+\.?\s*/, "")) // remove numbers, hyphens, bullets, and extra spaces
                .filter(k => k.length > 0); // filter out empty strings

            setKeywords(aiKeywords);

        } catch (error) {
            console.error("Keyword generation failed", error);
            setLocalError("Failed to generate keywords from AI");
        } finally {
            setLoadingKeyword(false);
        }
    };


    const handleKeywordAdd = () => {
        if (keywordInput.trim() && !keywords.includes(keywordInput)) {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput("");
        }
    };

    //   const handleGenerateKeywords = async () => {
    //     // Replace with actual AI API call
    //     const generated = ["sample", "ai", "generated", "keywords"];
    //     setKeywords([...new Set([...keywords, ...generated])]);
    //   };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append("licenceType", licenceType);
        formData.append("licenceText", licenceText);
        formData.append("keywords", JSON.stringify(keywords));
        formData.append("createdBy", loginDetails?.user?._id);
        if (image) formData.append("image", image);

        dispatch(createAsset(formData));
    };

    useEffect(() => {
        if (success) {
            setOpen(true);
            setName("");
            setLicenceType("");
            setLicenceText("");
            setKeywords([]);
            setKeywordInput("");
            setImage(null);
            setPreview(null);
            dispatch(resetState());
            navigate(-1);
        }
    }, [success, dispatch]);

    return (
        <Paper sx={{ padding: 3 }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2}>
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

                    {/* License Dropdown */}
                    <Grid item xs={12}>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="licence-type-label">License Type</InputLabel>
                            <Select
                                labelId="licence-type-label"
                                value={licenceType}
                                label="License Type"
                                onChange={(e) => setLicenceType(e.target.value)}
                                required
                            >
                                {LICENSE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="License Text (Optional)"
                            value={licenceText}
                            onChange={(e) => setLicenceText(e.target.value)}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={3}
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
                                        <Button onClick={handleKeywordAdd} size="small">Add</Button>
                                        <Button onClick={handleGenerateKeywords} size="small" sx={{ ml: 1 }}>
                                            Generate Keywords with AI
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                            {keywords.map((keyword, index) => (
                                <Chip
                                    key={index}
                                    label={keyword}
                                    onDelete={() =>
                                        setKeywords(keywords.filter((k) => k !== keyword))
                                    }
                                />
                            ))}
                            {loadingKeyword && <CircularProgress size={20} />}
                        </Box>
                    </Grid>

                    {/* Image Upload */}
                    <Grid item xs={12}>
                        <Grid container spacing={2} sx={{ mt: 2 }}>
                            <Grid item xs={6}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={<CloudUploadIcon />}
                                    fullWidth
                                >
                                    Upload Image
                                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                                </Button>
                            </Grid>
                            <Grid item xs={6}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                        setAiDescription("");
                                        setGeneratedImages([]);
                                        setAiModalOpen(true);
                                    }}
                                >
                                    Generate Image using AI
                                </Button>
                            </Grid>
                            {preview && (
                                <Box sx={{ position: "relative", mt: 2, ml: 2, display: "inline-block" }}>
                                    <img src={preview} alt="Preview" style={{ maxWidth: "50%", borderRadius: 4 }} />
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setPreview(null);
                                            setImage(null);
                                            setKeywords([]);
                                        }}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor: "white",
                                            ":hover": { backgroundColor: "#f0f0f0" },
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}
                        </Grid>
                    </Grid>

                    {/* Submit */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={loading}
                            sx={{ mt: 2 }}
                        >
                            {loading ? "Uploading..." : "Submit"}
                        </Button>
                    </Grid>

                    {/* Error Message */}
                    {(error || localError) && (
                        <Grid item xs={12}>
                            <Box sx={{ color: "red", textAlign: "center", mt: 2 }}>
                                {typeof (error || localError) === "string" ? (error || localError) : "An error occurred"}
                            </Box>
                        </Grid>
                    )}
                </Grid>
                <Notification open={open} onClose={() => setOpen(false)} message="Asset uploaded successfully!" />
            </Box>
            <Modal open={aiModalOpen} onClose={() => setAiModalOpen(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    width: 500,
                    borderRadius: 2
                }}>
                    <Typography variant="h6" gutterBottom>Generate Image using AI</Typography>

                    <TextField
                        label="Enter a description"
                        multiline
                        rows={3}
                        fullWidth
                        value={aiDescription}
                        onChange={(e) => setAiDescription(e.target.value)}
                        margin="normal"
                    />

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Artistic Style</InputLabel>
                        <Select
                            value={artisticStyle}
                            label="Artistic Style"
                            onChange={(e) => setArtisticStyle(e.target.value)}
                        >
                            {styles.find(s => s.category === "By Artistic Style")?.values.map(style => (
                                <MenuItem key={style} value={style}>{style}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Photography Style</InputLabel>
                        <Select
                            value={photoStyle}
                            label="Photography Style"
                            onChange={(e) => setPhotoStyle(e.target.value)}
                        >
                            {styles.find(s => s.category === "By Photography Style")?.values.map(style => (
                                <MenuItem key={style} value={style}>{style}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Use Case / Medium</InputLabel>
                        <Select
                            value={useCaseStyle}
                            label="Use Case / Medium"
                            onChange={(e) => setUseCaseStyle(e.target.value)}
                        >
                            {styles.find(s => s.category === "By Use Case or Medium")?.values.map(style => (
                                <MenuItem key={style} value={style}>{style}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>



                    <Button
                        variant="contained"
                        onClick={async () => {
                            const selectedStyle = [artisticStyle, photoStyle, useCaseStyle].filter(Boolean).join(', ');
                            if (!aiDescription) return setLocalError("Please enter a description");
                            if (!selectedStyle) return setLocalError("Please select a style");

                            setLoadingAI(true);
                            setGeneratedImages([]);
                            setLocalError("");

                            try {

                                const prompt = `${aiDescription}. Render it in ${selectedStyle} style. The image should:
- Be entirely original and creative, avoiding any real-world likenesses, actors, or famous individuals.
- Be free from any recognizable or copyrighted figures, brands, or logos.
- Be safe for work, suitable for educational, editorial, and professional purposes.
- Avoid any explicit, graphic, or controversial content.
- Be visually appealing, detailed, and appropriate for storytelling or informational use.
- Ensure high accuracy to the given description with no offensive or inappropriate elements.`;


                                const imagePromises = Array.from({ length: 3 }).map(() =>
                                    axiosInstance.post("/api/images/generate-image", {
                                        prompt,
                                        model: "gpt-4o-mini-2024-07-18",
                                    })
                                );

                                const responses = await Promise.all(imagePromises);
                                const images = responses.map(res => res.data.image);
                                setGeneratedImages(images);
                            } catch (err) {
                                console.error(err);
                                setLocalError("Image generation failed.");
                            } finally {
                                setLoadingAI(false);
                            }
                        }}
                        disabled={loadingAI}
                    >
                        {loadingAI ? <CircularProgress size={20} /> : "Create Image"}
                    </Button>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                        {generatedImages.length > 0 &&
                            generatedImages.map((base64, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        border: "2px solid #ccc",
                                        borderRadius: 2,
                                        p: 1,
                                        cursor: "pointer"
                                    }}
                                    onClick={async () => {
                                        const blob = await fetch(`data:image/png;base64,${base64}`).then(res => res.blob());
                                        const file = new File([blob], "ai-image.png", { type: "image/png" });
                                        setImage(file);
                                        setPreview(URL.createObjectURL(file));
                                        setAiModalOpen(false);
                                        setLocalError("");
                                    }}
                                >
                                    <img
                                        src={`data:image/png;base64,${base64}`}
                                        alt={`Generated ${index + 1}`}
                                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
                                    />
                                </Box>
                            ))}
                    </Box>
                </Box>
            </Modal>


        </Paper>
    );
};

export default AddAssets;
