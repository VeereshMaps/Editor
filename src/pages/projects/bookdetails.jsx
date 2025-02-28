import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Typography, Divider, CardActionArea, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { AddBox } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { getRoleBasedOrAllUsers } from 'redux/Slices/roleBasedOrAllUserSlice';

const ViewBookDetails = (props) => {
    console.log("---===",props);
    const dispatch = useDispatch();
    const roleBasedOrAllUsers = useSelector((state) => state.roleBasedOrAllUsers);
  const [formData, setFormData] = useState({
    title: props.bookDetails.projects.title,
    subtitle: '',
    author: '',
    proofReader: '',
    projectManager: '',
    designer: '',
    editor: '',
    teamLead: '',
    genre: '',
    isbn: '',
    language: props.bookDetails.projects.originLanguage,
    status: props.bookDetails.projects.status,
    releaseDate: '',
    royaltyRate: '',
    advancePayment: '',
    price: '',
    territoryRights: '',
    marketingPlan: '',
    pageCount: '',
    dimensions: '',
    paperType: '',
    coverType: '',
    copyright: '',
  });

  useEffect(() => {
          initialize()
      }, []);
  
      useEffect(() => {
          console.log("roleBasedOrAllUsers",roleBasedOrAllUsers);
          
      }, [roleBasedOrAllUsers]);
  
      const initialize = async () => {
          try {
              await dispatch(getRoleBasedOrAllUsers());
          } catch (error) {
              console.log("error", error);
          }
      }

//   useEffect(() => {
//     if (props.bookDetails && props.bookDetails.projects) {
//       setFormData((prevState) => ({
//         ...prevState,
//         title: props.bookDetails.projects.title,
//         author: props.bookDetails?.projects?.author?.firstName,
//         language: props.bookDetails.projects.originLanguage,
//       }));
//     }
//   }, [props.bookDetails]);

useEffect(() => {
    if (props.bookDetails?.projects) {
        console.log("props.bookDetails?.projects",props.bookDetails?.projects)
        const authorData = roleBasedOrAllUsers?.data?.find(user => user._id === props.bookDetails?.projects?.author?._id);
      const proofReaderData = roleBasedOrAllUsers?.data?.find(user => user._id === props.bookDetails?.projects?.proofReader?._id);
      const projectManagerData = roleBasedOrAllUsers?.data?.find(user => user._id === props.bookDetails?.projects?.projectManager?._id);
      const editorData = roleBasedOrAllUsers?.data?.find(user => user._id === props.bookDetails?.projects?.editor?._id);
      const designerData = roleBasedOrAllUsers?.data?.find(user => user._id === props.bookDetails?.projects?.designer?._id);
      const teamLeadData = props.bookDetails.projects.teamLead?.map(tl =>
        roleBasedOrAllUsers?.data?.find(user => user._id === tl._id)
    ) || [];
    console.log("teamLeadData",teamLeadData);
    
      setFormData(prevState => ({
        ...prevState,
        title: props.bookDetails.projects.title,
        author: authorData ? `${authorData.firstName} ${authorData.lastName}` : 'Not Available',
        proofReader: proofReaderData ? `${proofReaderData.firstName} ${proofReaderData.lastName}` : 'Not Available',
        projectManager: projectManagerData ? `${projectManagerData.firstName} ${projectManagerData.lastName}` : 'Not Available',
        teamLead: teamLeadData.length > 0
        ? teamLeadData.map(tl => tl ? `${tl.firstName} ${tl.lastName}` : 'Unknown').join(', ')
        : 'Not Available',
        designer: designerData ? `${designerData.firstName} ${designerData.lastName}` : 'Not Available',
        editor: editorData ? `${editorData.firstName} ${editorData.lastName}` : 'Not Available',
        language: props.bookDetails.projects.originLanguage,
      }));
    }
  }, [props.bookDetails, roleBasedOrAllUsers]);



  return (
    <Box>
        <>
          <Grid container spacing={3}>
            {/* Display Book Details */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Title:</strong> {formData.title || 'Not Available'}</Typography>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Subtitle:</strong> {formData.subtitle || 'Not Available'}</Typography>
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Author(s):</strong> {formData.author || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Proof Reader(s):</strong> {formData.proofReader || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Project Manager(s):</strong> {formData.projectManager || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Editor(s):</strong> {formData.editor || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Designer(s):</strong> {formData.designer || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Designer(s):</strong> {formData.designer || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Team Lead(s):</strong> {formData.teamLead || 'Not Available'}</Typography>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Genre:</strong> {formData.genre || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>ISBN:</strong> {formData.isbn || 'Not Available'}</Typography>
            </Grid> */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Language:</strong> {formData.language || 'Not Available'}</Typography>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Release Date:</strong> {formData.releaseDate || 'Not Available'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body1"><strong>Price:</strong> ${formData.price || 'Not Available'}</Typography>
            </Grid> */}
          </Grid>

         
        </>
      
    </Box>


  );
};

export default ViewBookDetails;
