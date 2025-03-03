import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAssets } from "../../redux/Slices/assetsSlice";

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
  const photosPerPage = 5; // Reduced for testing

  // Fetch images from API
  useEffect(() => {
    dispatch(fetchAssets({ page, limit: photosPerPage }));
  }, [dispatch, page]);

  // Search Filter
  const filteredPhotos = photos.filter((photo) =>
    photo?.src?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create a mutable copy of the filtered photos
  const mutablePhotos = filteredPhotos.map((photo) => ({
    ...photo, // Spread the existing properties
    width: photo.width, // Ensure width is copied
    height: photo.height, // Ensure height is copied
  }));

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
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <Grid container justifyContent="flex-end">
        {role === "Admin" &&
        <Button
          onClick={() => navigate("/add-assets")}
          variant="contained"
          color="primary"
          sx={{ maxWidth: "150px", width: "auto", marginBottom: 2 }}
        >
          Add Asset
        </Button>
        }
      </Grid>

      {/* Gallery Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : mutablePhotos.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Gallery photos={mutablePhotos} onClick={openLightbox} />
        </div>
      ) : (
        <p className="text-center">No images found.</p>
      )}

      {/* Pagination Component */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4} sx={{ minHeight: 50 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Modal Gateway for Lightbox */}
      <ModalGateway>
        {isOpen && (
          <Modal onClose={closeLightbox}>
            <Carousel
              currentIndex={currentImage}
              views={mutablePhotos.map((photo) => ({
                source: photo.src,
              }))}
            />
          </Modal>
        )}
      </ModalGateway>
    </div>
  );
};

export default AssetsLib;
