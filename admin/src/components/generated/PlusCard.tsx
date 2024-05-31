import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography,} from "@mui/material";
import { blue, green, grey, lightGreen } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import { Plus } from "lucide-react";

interface PlusCardProps extends BoxProps {
    setOpenAddPlanModal?: (status: boolean) => void;
}

const StyledPlanCard = styled(Box)(({ theme }: { theme: any }) => {
    return {
        width: "90%",
        height: "320px",
        padding: "16px",
        margin: "0 auto",
        backgroundColor: "#FFF",
        borderRadius: 2,
        cursor: "pointer"
    };
});

const PlusCard = (props: PlusCardProps) => {

    return (
        <StyledPlanCard onClick={() => typeof props.setOpenAddPlanModal === "function" && props.setOpenAddPlanModal(true)}>
            <Stack height={"100%"} justifyContent="center" alignItems={"center"} border={"4px dashed #bbb"} borderRadius={"5px"} >
                <Plus size={52} color={grey[400]} />
            </Stack>
        </StyledPlanCard>
    );
};

export default PlusCard;
