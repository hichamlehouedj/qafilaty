import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Tooltip, Typography} from "@mui/material";
import { grey, red, green } from "@mui/material/colors";
import { styled } from "@mui/system";
import React from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, Slash, Edit, XCircle, ArrowLeft, ArrowDown, ArrowUp} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import { useUpdateAccessesStock } from "../../graphql/hooks/stocks";
import useActiveStock from "../../graphql/hooks/stocks/useActiveStock";
import {ALL_STOCK} from "../../graphql/hooks/stocks/useGetAllStock";
import {useSnackbar} from "notistack";

interface DeliveryCardProps extends BoxProps {
    id: string;

    name: string;
    city: string;
    address: string;
    activation: string;
    phone01: string;
    phone02: string;
    createdAt: string;
    numberArchivedBoxes: string;
    numberNotArchivedBoxes: string;
    oneStockInfo?: any;
    setOneStockInfo?: object;
    setOpenUpdateStockModal?: (isOpen: boolean) => any;
}

const StyledDeliveryCard = styled(Box)(({ theme }: { theme: any }) => {
    return {
        width: "100%",
        height: "152px",
        padding: "16px",
        backgroundColor: "#FFF",
        borderRadius: 2,
    };
});

const StockCard = (props: DeliveryCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    let [activeStock] = useActiveStock();
    const [updateAccessesStock] = useUpdateAccessesStock();
    const userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const setStockInfo = () => {
        typeof props.setOneStockInfo == "function" &&
        props.setOneStockInfo({...props.oneStockInfo});
    };

    const handleOpenStock = (idStock: string) => {
        updateAccessesStock({
            variables: {
                idPerson: userData?.person?.id,
                idStock: idStock
            },
            onCompleted: ({updateAccessesStock}: any) => {
                console.log("updateAccessesStock ", {updateAccessesStock})
                if (updateAccessesStock?.status == true) {
                    window.open('https://stock.qafilaty.com/', '_self');
                }
            }
        })
    }

    let onActivationStock = (activation: string) => {
        activeStock({
            variables: {
                id: props?.id,
                activation
            },
            update: (cache, { data: { activeStock } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_STOCK,
                    variables: { idCompany: userData?.person?.company?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allStock' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allStock?.findIndex(
                        ({id}: any) => id === props.id
                    );
                }

                // @ts-ignore
                let newData = [...cacheData?.allStock];

                newData[findIndex] = {
                    ...newData[findIndex],
                    activation
                }

                cache.writeQuery({
                    query: ALL_STOCK,
                    variables: { idCompany: userData?.person?.company?.id },
                    data: {
                        allStock: newData,
                    },
                });

                cache.gc()
            }
        }).then(() => {
            if (activation === "active") {
                enqueueSnackbar("لقد تم تنشيط حساب الموظف بنجاح", {variant: "success"});
            } else {
                enqueueSnackbar("لقد تم إلغاء تنشيط حساب الموظف بنجاح", {variant: "success"});
            }
        })

    }

    return (
        <StyledDeliveryCard >
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <RAvatar size="44px" name={props.name} style={{ fontFamily: "Montserrat-Arabic"}} maxInitials={1}/>
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>{props.name}</Typography>
                                        <Typography variant="2xs" color={grey[400]}>{`${props.city} ${props.address}`}</Typography>
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <IconButton size={"small"} {...bindTrigger(popupState)}>
                                    <MoreHorizontal color={grey[500]} size={18} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item></Grid>
                </Grid>

                <Grid
                    container
                    justifyContent={"space-between"}
                    alignItems="center"
                    sx={{ direction: "rtl" }}
                >
                    <Grid item>
                        <Box>
                            <Stack direction={"row"} alignItems="center" height={"100%"} columnGap={"4px"}>
                                <Chip size={"medium"} variant="filled" color="info" dir="rtl"
                                    label={props.activation == "active" ? "نشط" : "غير نشط"}
                                    customColor={props.activation == "active" ? green["500"] : red["500"] }
                                />
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box>
                            <Stack direction={"row"} alignItems="center" height={"100%"} columnGap={"4px"}>
                                <Tooltip title="طرود مؤرشفة">
                                    <Typography variant="xs" color={grey[700]}>
                                        <ArrowDown color={grey[500]} size={16} style={{marginRight: "5px"}} />
                                        {props.numberArchivedBoxes}
                                    </Typography>
                                </Tooltip>

                                <Tooltip title="طرود نشطة">
                                    <Typography variant="xs" color={grey[700]}>
                                        <ArrowUp color={grey[500]} size={16} style={{marginRight: "5px"}} />
                                        {props.numberNotArchivedBoxes}
                                    </Typography>
                                </Tooltip>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                {
                    userData?.person?.company?.activation === "active" && (<>
                        <MenuItem onClick={() => handleOpenStock(props?.id)} key={1} >
                            <ListItemIcon><ArrowLeft size={18} strokeWidth={2} /></ListItemIcon>
                            الانتقال الى المكتب
                        </MenuItem>
                        <Divider></Divider>
                    </>)
                }


                <MenuItem  key={2}
                    onClick={() => {
                        setStockInfo();
                        typeof props.setOpenUpdateStockModal == "function" &&
                        props.setOpenUpdateStockModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon><Edit size={18} strokeWidth={2} /></ListItemIcon>
                    تعديل المكتب
                </MenuItem>

                {props.activation === "active" ?
                    (<MenuItem  key={3}
                        onClick={() => {
                            onActivationStock("desactive");
                            popupState.close();
                        }}
                    >
                        <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إلغاء تنشيط المكتب
                    </MenuItem>)
                    : (<MenuItem  key={4}
                        onClick={() => {
                            onActivationStock("active");
                            popupState.close();
                        }}
                    >
                        <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>تنشيط المكتب
                    </MenuItem>)
                }
            </Menu>
        </StyledDeliveryCard>
    );
};

export default StockCard;
