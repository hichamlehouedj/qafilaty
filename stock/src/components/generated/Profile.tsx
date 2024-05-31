import {
    Avatar,
    Box,
    CardActionArea,
    Divider,
    Popover,
    PopoverProps,
    Stack,
    Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React from "react";
import { LogOut } from "react-feather";
import { default as RAvatar } from "react-avatar";
import { useLogout } from "../../graphql/hooks/users";
import { useRouter } from "next/router";
import useStore from "../../store/useStore";

interface Props extends PopoverProps {
    fullname?: string;
    email?: string;
    clientId?: string /* avatar purposes */;
}

const StyledPopOver = styled(Popover)(
    ({ theme, color }: { theme: any; color?: any }) => {
        return {
            [`& .MuiPopover-paper`]: {
                ...theme.typography["sm"],
                boxShadow: theme.shadows[25].elevation3,
                height: "130px",
                width: "288px",
            },

            "& .Profile-top": {
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
            },
            "& .Profile-bottom": {
                display: "flex",
                alignItems: "center",
                padding: "0 28px",
            },
        };
    }
);

export const Profile = (props: Props) => {
    const [logoutMutation] = useLogout();
    const route = useRouter();
    return (
        <StyledPopOver {...(props as any)}>
            <Stack height={"100%"}>
                <Box className="Profile-top" height={"80px"}>
                    <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                        {/* <Avatar
              sizes="44px"
              sx={{ width: 40, height: 40 }}
              src="https://i.pravatar.cc/150?img=33"
            ></Avatar> */}
                        <RAvatar
                            size="40px"
                            name={props.fullname}
                            round
                            style={{ fontFamily: "Montserrat-Arabic" }}
                            maxInitials={1}
                        ></RAvatar>
                        <Stack rowGap={"2px"}>
                            <Typography variant="xs" color={grey[800]}>
                                {props.fullname}
                            </Typography>
                            <Typography variant="2xs" color={grey[400]}>
                                {props.email}
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>
                <Divider style={{ borderStyle: "dashed" }}></Divider>
                <Box
                    flex={"1"}
                    onClick={() => {
                        logoutMutation();
                        useStore.setState({ token: "" });
                        useStore.setState({ isAuth: false });
                        useStore.setState({ userData: {} });
                        route.push("/signin");
                    }}
                >
                    <CardActionArea style={{ height: "100%" }}>
                        <Box className="Profile-bottom">
                            <Stack direction={"row"} alignItems="center" columnGap="16px">
                                <Box>
                                    <LogOut size={18} color={grey[600]}></LogOut>
                                </Box>
                                <Box>
                                    <Typography variant="xs" color={grey[600]}>
                                        تسجيل الخروج
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    </CardActionArea>
                </Box>
            </Stack>
        </StyledPopOver>
    );
};
