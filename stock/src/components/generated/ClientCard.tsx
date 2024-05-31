import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography,} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, Edit, UserX, User, UserPlus, XOctagon, UserCheck} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import {useSnackbar} from "notistack";
import {useDeleteClient} from "../../graphql/hooks/clients";
import {ALL_CLIENTS} from "../../graphql/hooks/clients/useGetAllClients";
import {useActivationUser} from "../../graphql/hooks/users";
import {useRouter} from "next/router";

interface ClientCardProps extends BoxProps {
    id: string;
    id_person: string;
    name: string;
    email: string;
    phone: string;
    user: boolean;
    activation: string;
    setOpenAddUserModal?: (isOpen: boolean) => any;
    setPersonID?: (id: string) => any;
    setOpenUpdateClientModal?: (isOpen: boolean) => any;
    setClientID?: (id: string) => any;
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

const ClientCard = (props: ClientCardProps) => {
    const route = useRouter();
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    let [deleteClient] = useDeleteClient();
    let [activationUser] = useActivationUser();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let onDeleteClient = (id: string) => {
        deleteClient({
            variables: {
                id_person: id
            },
            update: (cache, { data: { deleteClient } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allClients' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allClients?.findIndex(
                        ({id}: any) => id === props.id
                    );
                }

                // @ts-ignore
                let newData = [...cacheData?.allClients];

                let positionData = newData.splice(findIndex, 1);

                cache.writeQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allClients: newData,
                    },
                });

                cache.gc()
            }
        }).then(() => {
            enqueueSnackbar("لقد تمت حذف العميل بنجاح", {variant: "success"});
            setTimeout(() => closeSnackbar(), 3000)
        })

    }

    let onActivationUser = (id: string, activation: string) => {
        activationUser({
            variables: {
                id_person: id,
                activation
            },
            update: (cache, { data: { activationUser } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allClients' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allClients?.findIndex(
                        ({id}: any) => id === props.id
                    );
                }

                // @ts-ignore
                let newData = [...cacheData?.allClients];

                newData[findIndex] = {...newData[findIndex], user: {...newData[findIndex].user, activation}}

                cache.writeQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allClients: newData,
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
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <RAvatar size="44px" name={props.name} round style={{ fontFamily: "Montserrat-Arabic" }} maxInitials={1}></RAvatar>
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>{props.name}</Typography>
                                        <Typography variant="2xs" color={grey[400]}>{props.email || "بدون بريد إلكتروني"}</Typography>
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

                <Grid container justifyContent={"space-between"} alignItems="center" sx={{ direction: "rtl" }}>
                    <Grid item>
                        {
                            props.user ?
                                props.activation === "active"
                                    ? <Chip size={"medium"} variant="filled" label={"نشط"} color="success" rounded={"true"} dir="rtl" />
                                    : <Chip size={"medium"} variant="filled" label={"غير نشط"} color="error" rounded={"true"} dir="rtl" />
                                : <Chip size={"medium"} variant="filled" label={"بدون حساب"} color="default" rounded={"true"} dir="rtl" />
                        }
                    </Grid>

                    <Grid item>
                        <Typography variant="2xs"  color={grey[500]}> {props.phone} </Typography>
                    </Grid>

                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <MenuItem onClick={() => {route.push(`/client/${props.id}`)}} >
                    <ListItemIcon><User size={18} strokeWidth={2} /></ListItemIcon>الملف الشخصي
                </MenuItem>
                {!props.user ?
                    props.email && (<MenuItem
                        onClick={() => {
                            typeof props.setPersonID  == "function" && props.setPersonID(props.id_person);
                            typeof props.setOpenAddUserModal == "function" && props.setOpenAddUserModal(true);
                            popupState.close();
                        }}
                    >
                        <ListItemIcon><UserPlus size={18} strokeWidth={2} /></ListItemIcon> اضافة حساب
                    </MenuItem>)
                    : props.activation === "active" ?
                        (<MenuItem
                            onClick={() => {
                                onActivationUser(props.id_person, "desactive");
                                popupState.close();
                            }}
                        >
                            <ListItemIcon><XOctagon size={18} strokeWidth={2} /></ListItemIcon>إلغاء تنشيط الحساب
                        </MenuItem>)
                        : (<MenuItem
                            onClick={() => {
                                onActivationUser(props.id_person, "active");
                                popupState.close();
                            }}
                        >
                            <ListItemIcon><UserCheck size={18} strokeWidth={2} /></ListItemIcon>تنشيط الحساب
                        </MenuItem>)
                }

                <Divider></Divider>
                <MenuItem
                    onClick={() => {
                        typeof props.setClientID  == "function" && props.setClientID(props.id);
                        typeof props.setOpenUpdateClientModal == "function" && props.setOpenUpdateClientModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon><Edit size={18} strokeWidth={2} /></ListItemIcon> تعديل العميل
                </MenuItem>
                <MenuItem  onClick={ () => {
                    onDeleteClient(props.id_person)
                } } >
                    <ListItemIcon><UserX size={18} strokeWidth={2} /></ListItemIcon> حذف العميل
                </MenuItem>
            </Menu>
        </StyledDeliveryCard>
    );
};

export default ClientCard;