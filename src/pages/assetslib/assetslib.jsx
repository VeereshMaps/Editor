import React, { useEffect, useState, useCallback } from "react";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
import {
    TextField,
    Pagination,
    Box,
    Button,
    Grid,
    CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../redux/Slices/assetsSlice";
import { downloadAssetsById } from "redux/Slices/downloadAssetSlice";
import { debounce } from "lodash";

const AssetsLib = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { photos, totalPages, loading, error } = useSelector((state) => state.assets);
    const loginDetails = useSelector((state) => state.auth);
    const [currentImage, setCurrentImage] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const role = loginDetails?.user?.role;
    const photosPerPage = 20;

    // Debounce API call to prevent excessive requests
    const delayedSearch = useCallback(
        debounce((query, page) => {
            dispatch(fetchAssets({ search: query, page, limit: photosPerPage }));
        }, 500), // 500ms delay
        [dispatch]
    );

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
        delayedSearch(e.target.value, 1);
    };

    // Fetch images when page changes
    useEffect(() => {
        dispatch(fetchAssets({ search: searchTerm, page, limit: photosPerPage }));
    }, [dispatch, page]);

    // Lightbox Handlers
    const openLightbox = (event, { photo, index }) => {
        setCurrentImage(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setCurrentImage(0);
        setIsOpen(false);
    };

    return (
        <div className="p-4">
            {/* Search Bar */}
            <TextField
                fullWidth
                label="Search Images"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ marginBottom: "20px" }}
            />

            <Grid container justifyContent="flex-end">
                {role === "Admin" && (
                    <Button
                        onClick={() => navigate("/add-assets")}
                        variant="contained"
                        color="primary"
                        sx={{ maxWidth: "150px", width: "auto", marginBottom: 2 }}
                    >
                        Add Asset
                    </Button>
                )}
            </Grid>

            {/* Gallery Grid */}
            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : photos.length > 0 ? (
                <>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-auto" style={{ maxHeight: "70vh",overflow:'auto' }}>
                        {/* <></> */}
                        <Gallery
                            photos={photos.map((photo, index) => ({
                                ...photo,
                                key: String(photo.id || index) // Ensure key is a string
                            }))}
                            margin={10}
                            onClick={openLightbox}
                            renderImage={(props) => <CustomImage key={props.photo.key} {...props} />}
                        />
                    </div>
                    {/* Pagination Component */}
                    {totalPages > 1 && (
                        <Box sx={{ position:"absolute",minHeight: 50,left:"50%", backgroundColor:"#f0f0f0" }}>
                            <Pagination
                                count={totalPages}
                                page={page}
                                onChange={(event, value) => setPage(value)}
                                color="primary"
                                style={{padding:"10px"}}
                            />
                        </Box>
                    )}
                </>
            ) : (
                <p className="text-center">No images found.</p>
            )}



            {/* Modal Gateway for Lightbox */}
            <ModalGateway>
                {isOpen && (
                    <Modal onClose={closeLightbox} style={{ overflowY: "auto", maxHeight: "100%" }}>
                        <Carousel
                            currentIndex={currentImage}
                            views={photos.map((photo) => ({
                                source: photo.src,
                            }))}
                        />
                    </Modal>
                )}
            </ModalGateway>
        </div>
    );
};

const CustomImage = ({ photo, onClick, index }) => {
    const dispatch = useDispatch();

    const handleDownload = () => {
        dispatch(downloadAssetsById(photo.id))
            .unwrap()
            .then((response) => {
                const s3Url = response.imageUrl;

                const link = document.createElement("a");
                link.href = s3Url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.log("Error downloading image", error);
            });
    };

    return (
        <div style={{ position: "relative", display: "inline-block", marginRight: 5, marginLeft: 5 }}>
            <img
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                onClick={(event) => onClick(event, { photo, index })}
                style={{ cursor: "pointer", borderRadius: "5px" }}
            />
            {/* Download Button */}
            <Button
                variant="contained"
                size="small"
                sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    backgroundColor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    minWidth: "unset",
                    padding: "5px",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(photo.alt);
                }}
            >
                <DownloadIcon />
            </Button>
        </div>
    );
};

export default AssetsLib;
