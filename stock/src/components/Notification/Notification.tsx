import {Box, CardActionArea, Popover, PopoverProps, Stack} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import clsx from "clsx";
import React, { useEffect } from "react";
import { ChevronDown } from "react-feather";
import { useDebouncedCallback } from "use-debounce";

export interface Props extends PopoverProps {
    isOpen?: boolean;
    onMaximize?: (maximizeStatus: boolean) => any;
}

const StyledPopOver = styled(Popover)(({ theme }: { theme: any; color?: any }) => {
    return {
        [`& .MuiPopover-paper`]: {
            ...theme.typography["sm"],
            boxShadow: theme.shadows[25].elevation3,
            height: "auto",
            "&.maximize": {
                height: "90vh",
                "& .Notification-footer": {
                    display: "none !important",
                },
            },
            "&.maximize .Notification-innerContent": {
                overflowY: "auto",
            },
            "& .Notification-content": {
                height: "100%",
                "& .Notification-title": {
                    height: "54px",
                    backgroundColor: "White",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 16px",
                    color: grey[800],
                    borderBottom: `1px solid ${grey[200]}`,
                    "&--icon": {
                        "& svg": {
                            verticalAlign: "middle",
                            width: 20,
                            height: 20,
                            marginLeft: "-2px",
                        },
                    },
                },

                "& .Notification-close": {
                    "& .MuiIconButton-root": {
                        color: grey[800],
                        "& svg": {
                            verticalAlign: "middle",
                            width: 22,
                            height: 22,
                        },
                    },
                },
                "& .Notification-innerContent": {
                    flex: "1"
                },
                "& .MuiButtonBase-root.MuiCardActionArea-root": {
                    color: theme.palette?.secondary?.dark,
                },
                "& .Notification-footer": {
                    ...theme.typography["2xs"],
                    letterSpacing: "0.02rem",
                    height: "48px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 16px",
                    justifyContent: "center",
                    borderTop: `1px solid ${grey[200]}`,
                    color: theme.palette?.secondary?.main,
                    "&--icon": {
                        "& svg": {
                            verticalAlign: "top",
                            width: 15,
                            height: 15,
                            strokeWidth: 3,
                        },
                    },
                },
            },
        },
    };
});

const Notification = (props: Props) => {
    let [maximize, setMaximize] = React.useState(false);
    let maximizeDelayed = useDebouncedCallback(() => {
        setMaximize(false);
        typeof props.onMaximize == "function" && props.onMaximize(true);
    }, 500);

    useEffect(() => {
        if (!props.isOpen) {
            maximizeDelayed();
        }
    }, [props.isOpen]);

    return (
        <>
            <StyledPopOver {...(props as any)} PaperProps={{ className: clsx({ maximize }) }}>
                <Box className="Notification-content" sx={{ minWidth: "384px", maxWidth: "400px" }} onClick={props.onClick}>
                    <Box sx={{ borderRadius: "6px", height: "100%" }}>
                        <Stack height={"100%"}>
                            <Box className="Notification-title">
                                <Stack direction="row" flexShrink={0}>
                                    <div className="Notification-title--label">الإشعارات</div>
                                </Stack>
                                <div className="Notification-close"/>
                            </Box>
                            <Box className="Notification-innerContent">{props.children}</Box>
                            <CardActionArea
                                onClick={() => {
                                    setMaximize(!maximize);
                                    typeof props.onMaximize == "function" && props.onMaximize(false);
                                }}
                            >
                                <Box className="Notification-footer">
                                    <Stack direction="row" spacing="4px" flexShrink={0}>
                                        <div className="Notification-footer--label">عرض كل الإشعارات</div>
                                        <div className="Notification-footer--icon"><ChevronDown/></div>
                                    </Stack>
                                </Box>
                            </CardActionArea>
                        </Stack>
                    </Box>
                </Box>
            </StyledPopOver>
        </>
    );
};

export default Notification;