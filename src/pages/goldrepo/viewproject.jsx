import React, { useEffect, useState } from 'react';
import { Box, Tabs, Tab, Paper, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Button, Card, CardContent, Typography, Divider, CardActionArea, Stack } from '@mui/material';
import MainCard from 'components/MainCard';
import { AddBox } from '@mui/icons-material';
import { useLocation } from 'react-router';
import { useDispatch } from 'react-redux';

const ViewGoldBook = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const goldProjectsData = location.state?.bookData;
    const [mainTab, setMainTab] = useState(0); // Since only one main tab "Records"
    const [subTab, setSubTab] = useState(0); // Index of selected category

    const [categories, setCategories] = useState([]); // Unique categories from versions
    const [groupedData, setGroupedData] = useState({}); // Versions grouped by category

    useEffect(() => {
        // Extract unique categories and group versions by category
        if (goldProjectsData?.versions) {
            const groups = goldProjectsData.versions.reduce((acc, version) => {
                if (!acc[version.category]) acc[version.category] = [];
                acc[version.category].push(version);
                return acc;
            }, {});

            setGroupedData(groups);
            setCategories(Object.keys(groups)); // e.g., ["coverdesign", "TypeSetting"]
        }
    }, [goldProjectsData]);

    // Handle Sub Tab Change
    const handleSubTabChange = (event, newValue) => {
        setSubTab(newValue);
    };



  return (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            {/* Main Tabs (Only Records for now) */}
            <Tabs
                value={mainTab}
                onChange={(e, v) => setMainTab(v)}
                sx={{ borderBottom: 1, borderColor: "divider" }}
            >
                <Tab label="Records" />
            </Tabs>

            <Box sx={{ display: "flex", flex: 1, height: "100%" }}>
                {/* Vertical Category Tabs */}
                <Box sx={{ minWidth: 200, borderRight: 1, borderColor: "divider", p: 2 }}>
                    <Tabs
                        orientation="vertical"
                        variant="scrollable"
                        value={subTab}
                        onChange={handleSubTabChange}
                        sx={{ alignItems: "flex-start" }}
                    >
                        {categories.map((cat, index) => (
                            <Tab
                                key={index}
                                label={<Typography sx={{ textTransform: "capitalize" }}>{cat}</Typography>}
                                sx={{ alignItems: "flex-start", justifyContent: "flex-start", textAlign: "left" }}
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* File Viewer */}
                <Box
                    sx={{
                        flex: 1,
                        p: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "500px",
                    }}
                >   
                    {categories.length > 0 && groupedData[categories[subTab]]?.[0]?.fileStorageUrl ? (
                        <iframe
                            src={groupedData[categories[subTab]][0].fileStorageUrl}
                            width="100%"
                            height="100%"
                            style={{ border: "none", minHeight: "500px" }}
                            title={`File - ${categories[subTab]}`}
                            onError={(e) => console.error("Failed to load file:", e)}
                        ></iframe>
                    ) : (
                        <Typography variant="h6" color="textSecondary">
                            No data found
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
  );
};

export default ViewGoldBook;
