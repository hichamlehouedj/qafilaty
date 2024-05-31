import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography,} from "@mui/material";
import { blue, green, grey, lightGreen } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import {MoreHorizontal, List, Slash,} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import useStore from "../../store/useStore";
import { Edit } from "lucide-react";
import Image from "next/image";

interface PlanCardProps extends BoxProps {
    id: string;

    image: string;
    title: string;
    description: string;
    show: boolean;

    setOpenUpdatePlanModal?: (status: boolean) => void;
    setPlanData?: (data: object) => void;
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

const PlanCard = (props: PlanCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    const [showHead, setShowHead] = useState(false)

    return (
        <StyledPlanCard onMouseEnter={() => setShowHead(true)} onMouseLeave={() => setShowHead(false)} >
            <Stack height={"100%"} justifyContent="flex-start" >
                <Grid container justifyContent={"space-between"} visibility={showHead ? "visible" : "hidden"}>
                    <Grid item>
                        <Image src={props.image} width={30} height={30} alt={""} />
                    </Grid>
                    <Grid item>
                        <IconButton size={"small"} {...bindTrigger(popupState)} >
                            <MoreHorizontal color={grey[500]} size={18} />
                        </IconButton>
                    </Grid>
                </Grid>
                <Grid container justifyContent={"center"}>
                    <Image src={props.image} width={80} height={80} alt={""} />
                </Grid>
                <Grid container justifyContent={"center"} marginTop={"20px"}>
                    <Typography variant="lg" color={grey[800]}>{props.title}</Typography>
                </Grid>

                <Grid container justifyContent={"center"} marginTop={"15px"}>
                    <Typography variant="2xs" textAlign={"center"} color={grey[600]}>{props.description}</Typography>
                </Grid>

                <Divider color={props.show ? green[500] : grey[500] } style={{borderWidth: "2px", marginTop: "30px" }} />


                <Grid container justifyContent={"center"} marginTop={"15px"}>
                    <Typography variant="xs" textAlign={"center"} color={grey[600]}>
                        {props.show ? "معروض" : "غير معروض"}
                    </Typography>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={()=> {
                    typeof props.setOpenUpdatePlanModal === "function" && props.setOpenUpdatePlanModal(true)
                    typeof props.setPlanData === "function" && props.setPlanData({
                        id: props.id,
                        title: props.title
                    })
                    popupState.close();
                }}>
                    <ListItemIcon>
                        <Edit size={18} strokeWidth={2} />
                    </ListItemIcon>
                    تعديل العرض
                </MenuItem>
            </Menu>
        </StyledPlanCard>
    );
};

export default PlanCard;
