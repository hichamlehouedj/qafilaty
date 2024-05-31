import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography,} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, UserCheck, UserPlus, UserX, Edit, XOctagon, User} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import {useDeleteEmployee} from "../../graphql/hooks/employees";
import {useSnackbar} from "notistack";
import {ALL_FACTORS} from "../../graphql/hooks/employees/useGetAllEmployees";
import {useActivationUser} from "../../graphql/hooks/users";
import {useRouter} from "next/router";

interface EmployeeCardProps extends BoxProps {
    id: string;
    id_person: string;
    name: string;
    phone: string;
    user: boolean;
    activation: string;
    department: string;
    setOpenAddUserModal?: (isOpen: boolean) => any;
    setPersonID?: (id: string) => any;
    setOpenUpdateEmployeeModal?: (isOpen: boolean) => any;
    setEmployeeID?: (id: string) => any;
    setPersonRole?: (role: string) => any;
}

const StyledEmployeeCard = styled(Box)(({ theme }: { theme: any }) => {
    return {
        width: "100%",
        height: "152px",
        padding: "16px",
        backgroundColor: "#FFF",
        borderRadius: 2,
    };
});

const EmployeeCard = (props: EmployeeCardProps) => {
    const route = useRouter();
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    let [deleteEmployee] = useDeleteEmployee();
    let [activationUser] = useActivationUser();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const userData = useStore((state: any) => state.userData);

    let onDeleteEmployee = (id: string) => {
        deleteEmployee({
            variables: {
                id_person: id
            },
            update: (cache, { data: { updateFactor } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allFactors' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allFactors?.findIndex(
                        ({id}: any) => id === props.id
                    );
                }

                // @ts-ignore
                let newData = [...cacheData?.allFactors];

                let positionData = newData.splice(findIndex, 1);

                cache.writeQuery({
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allFactors: newData,
                    },
                });

                cache.gc()
            }
        }).then(() => {
            enqueueSnackbar("لقد تمت حذف الموظف بنجاح", {variant: "success"});
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
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allFactors' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allFactors?.findIndex(
                        ({id}: any) => id === props.id
                    );
                }

                // @ts-ignore
                let newData = [...cacheData?.allFactors];

                newData[findIndex] = {...newData[findIndex], user: {...newData[findIndex].user, activation}}

                cache.writeQuery({
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allFactors: newData,
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
        <StyledEmployeeCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <RAvatar size="44px" name={props.name} round style={{ fontFamily: "Montserrat-Arabic" }} maxInitials={1}></RAvatar>
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>{props.name}</Typography>
                                        <Typography variant="2xs" color={grey[400]}>{props.phone}</Typography>
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
                                : <Chip size={"medium"} variant="filled" label={"بدون حساب"} color="error" rounded={"true"} dir="rtl" />
                        }
                    </Grid>

                    <Grid item>
                        <Typography variant="2xs"  color={grey[500]}> {props.department} </Typography>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>

                {props.department == "سائق" && (
                    <MenuItem onClick={() => {route.push(`/driver/${props.id}`)}} >
                        <ListItemIcon><User size={18} strokeWidth={2} /></ListItemIcon>الملف الشخصي
                    </MenuItem>
                )}

                {!props.user ?
                    (<MenuItem
                        onClick={() => {
                            typeof props.setPersonRole  == "function" && props.setPersonRole(props.department == "سائق" ? "Driver" : "Factor")
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
                        typeof props.setEmployeeID  == "function" && props.setEmployeeID(props.id);
                        typeof props.setOpenUpdateEmployeeModal == "function" && props.setOpenUpdateEmployeeModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon><Edit size={18} strokeWidth={2} /></ListItemIcon> تعديل الموظف
                </MenuItem>
                <MenuItem  onClick={ () => {
                    onDeleteEmployee(props.id_person)
                } } >
                    <ListItemIcon><UserX size={18} strokeWidth={2} /></ListItemIcon> حذف الموظف
                </MenuItem>
            </Menu>
        </StyledEmployeeCard>
    );
};

export default EmployeeCard;
