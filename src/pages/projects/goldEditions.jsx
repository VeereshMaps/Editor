import React, { useEffect } from "react";
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Stack
} from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { getGoldEditionsByProjectId } from "redux/Slices/goldEditionByProjectIdSlice";
import { use } from "react";

const GoldEditions = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const editionByProjectIdDetails = useSelector((state) =>
        state.editionsGold
    );
    const { projectId } = useParams();

    useEffect(() => {
        if (projectId) {
            dispatch(getGoldEditionsByProjectId(projectId));
        }
    }, [projectId, dispatch]);

    useEffect(() => {
        console.log("editionByProjectIdDetails", editionByProjectIdDetails);
    }, [editionByProjectIdDetails]);


    return (
        <Grid container spacing={2} alignItems="stretch">
            {editionByProjectIdDetails?.editions?.length > 0 ? (
                editionByProjectIdDetails.editions.map((edition, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                position: "relative"
                            }}
                        >
                            <CardContent sx={{ padding: 2, flexGrow: 1 }}>
                                <Typography variant="h6">
                                    <b>Title: {edition.title}</b>
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                        WebkitLineClamp: 4,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    <b>Description : </b>
                                    {edition.description}
                                </Typography>
                            </CardContent>
                            <Stack direction="row" spacing={1} sx={{ padding: 2, justifyContent: "flex-start" }}>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    onClick={() =>
                                        navigate(`/goldprojects/view/${edition._id}`,{ state: { jsonContent: edition } })
                                    }
                                >
                                    View
                                </Button>
                            </Stack>
                        </Card>
                    </Grid>
                ))
            ) : (
                <Typography>{editionByProjectIdDetails?.error?.message}</Typography>
            )}
        </Grid>
    );
};

export default GoldEditions;
