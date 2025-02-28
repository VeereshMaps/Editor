import React, { useEffect, useState } from 'react';
import Gallery from 'react-photo-gallery';
import Carousel, { Modal, ModalGateway } from 'react-images';
import { TextField, Pagination, Box } from '@mui/material';

// Sample image URLs
const imageUrls = [
  'https://picsum.photos/600/400?random=1',
  'https://picsum.photos/800/600?random=2',
  'https://picsum.photos/400/400?random=3',
  'https://picsum.photos/600/800?random=4',
  'https://picsum.photos/1200/800?random=5',
  'https://picsum.photos/600/400?random=14',
  'https://picsum.photos/800/600?random=21',
  'https://picsum.photos/400/400?random=32',
  'https://picsum.photos/600/800?random=42',
  'https://picsum.photos/1200/800?random=55',
];

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const photosPerPage = 30;

  // Function to dynamically fetch image dimensions
  const fetchImageDimensions = async (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ src: url, width: img.width, height: img.height });
      img.src = url;
    });
  };

  // Load photos with dimensions
  useEffect(() => {
    const loadPhotos = async () => {
      const loadedPhotos = await Promise.all(imageUrls.map(fetchImageDimensions));
      setPhotos(loadedPhotos);
    };

    loadPhotos();
  }, []);

  // Paginate Photos
  const totalPages = Math.ceil(photos.length / photosPerPage);
  const startIndex = (page - 1) * photosPerPage;
  const paginatedPhotos = photos.slice(startIndex, startIndex + photosPerPage);

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
        style={{ marginBottom: '20px' }}
      />

      {/* Gallery Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedPhotos.length > 0 ? (
          <Gallery photos={paginatedPhotos} onClick={openLightbox} />
        ) : (
          <p className="text-center">Loading images...</p>
        )}
      </div>

      {/* Pagination Component */}
      <Box display="flex" justifyContent="center" mt={4}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(event, value) => setPage(value)}
          color="primary"
        />
      </Box>

      {/* Modal Gateway for Lightbox */}
      <ModalGateway>
        {isOpen && (
          <Modal onClose={closeLightbox}>
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

export default GalleryPage;
