import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography} from "@mui/material";
import {grey, red, green} from "@mui/material/colors";
import { styled } from "@mui/system";
import React, {useState} from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, List, Printer, Archive} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import Link from "next/link";
import {useAddEnvelope, useRemoveEnvelope} from "../../graphql/hooks/envelopes";
import useStore from "../../store/useStore";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import {useSnackbar} from "notistack";
import {ALL_ENVELOPE_CITY} from "../../graphql/hooks/envelopes/useGetOpenEnvelopeCity";
import {ALL_CLOSE_ENVELOPE_CITY} from "../../graphql/hooks/envelopes/useGetCloseEnvelopeCity";

interface DeliveryCardProps extends BoxProps {
    code_invoice?: string;
    city?: string;
    codeEnvelope?: string;
    numberBox?: string;
    totalMouny?: string;

    showClosse: boolean;
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

const EnvelopeCard = (props: DeliveryCardProps) => {
    const userData = useStore((state: any) => state.userData);
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const [addEnvelope] = useAddEnvelope();
    const [removeEnvelope] = useRemoveEnvelope();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const onAddEnvelope = () => {
        if (props.city !== undefined) {
            addEnvelope({
                variables: {
                    idStock: userData?.person?.list_stock_accesses?.stock?.id,
                    city: props.city
                },
                update: (cache, { data: { addEnvelopeCode } }) => {
                    console.log({ addEnvelopeCode })

                    let cacheOpenData: object | null = {}

                    cacheOpenData = cache.readQuery({
                        query: ALL_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });

                    let cacheCloseData: object | null = {}

                    cacheCloseData = cache.readQuery({
                        query: ALL_CLOSE_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });
                    console.log({cacheOpenData, cacheCloseData})

                    let findIndex: any
                    if (typeof cacheOpenData === 'object' && cacheOpenData !== null && 'openEnvelopeCity' in cacheOpenData) {
                        // @ts-ignore
                        findIndex = cacheOpenData?.openEnvelopeCity?.findIndex(
                            ({city}: any) => city === props.city
                        );
                    }

                    let updatedData = {
                        // @ts-ignore
                        ...cacheOpenData?.openEnvelopeCity?.[findIndex],
                        codeEnvelope: addEnvelopeCode?.codeEnvelope
                    }

                    // @ts-ignore
                    let newDataOpen = [...cacheOpenData?.openEnvelopeCity];

                    newDataOpen.splice(findIndex, 1);

                    cache.writeQuery({
                        query: ALL_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            openEnvelopeCity: newDataOpen,
                        },
                    });

                    // @ts-ignore
                    let newDataClose = [
                        {...updatedData},
                        // @ts-ignore
                        ...cacheCloseData?.closeEnvelopeCity
                    ];

                    cache.writeQuery({
                        query: ALL_CLOSE_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            closeEnvelopeCity: newDataClose,
                        },
                    });
                }
            })
            .then(() => {
                enqueueSnackbar("لقد تمت إضافة طرد بنجاح", {variant: "success", autoHideDuration: 5000});
            }).catch((error) => {
                console.log(error)
            });
        }
    }

    const onRemoveEnvelope = () => {
        if (props.codeEnvelope !== undefined) {
            removeEnvelope({
                variables: {
                    codeEnvelope: props.codeEnvelope
                },
                update: (cache, { data: { deleteEnvelopeCode } }) => {

                    let cacheOpenData: object | null = {}

                    cacheOpenData = cache.readQuery({
                        query: ALL_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });

                    let cacheCloseData: object | null = {}

                    cacheCloseData = cache.readQuery({
                        query: ALL_CLOSE_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id }
                    });

                    let findIndex: any
                    if (typeof cacheCloseData === 'object' && cacheCloseData !== null && 'closeEnvelopeCity' in cacheCloseData) {
                        // @ts-ignore
                        findIndex = cacheCloseData?.closeEnvelopeCity?.findIndex(
                            ({codeEnvelope}: any) => codeEnvelope === props.codeEnvelope
                        );
                    }

                    let updatedData = {
                        // @ts-ignore
                        ...cacheCloseData?.closeEnvelopeCity?.[findIndex],
                        codeEnvelope: deleteEnvelopeCode?.codeEnvelope
                    }

                    // @ts-ignore
                    let newDataClose = [...cacheCloseData?.closeEnvelopeCity];

                    newDataClose.splice(findIndex, 1);

                    cache.writeQuery({
                        query: ALL_CLOSE_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            closeEnvelopeCity: newDataClose,
                        },
                    });

                    // @ts-ignore
                    let newDataOpen = [
                        {...updatedData},
                        // @ts-ignore
                        ...cacheOpenData?.openEnvelopeCity
                    ];

                    cache.writeQuery({
                        query: ALL_ENVELOPE_CITY,
                        variables: { idStock: userData?.person?.list_stock_accesses?.stock?.id },
                        data: {
                            openEnvelopeCity: newDataOpen,
                        },
                    });
                }
            })
            .then(() => {
                enqueueSnackbar("لقد تمت إضافة طرد بنجاح", {variant: "success", autoHideDuration: 5000});
            }).catch((error) => {
                console.log(error)
            });
        }
    }

    return (
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <Divider orientation="vertical" variant="fullWidth" flexItem style={{borderColor: props?.codeEnvelope !== "0" ? red["500"] : green["500"], borderWidth: "2px", borderRadius: "3px"}} />
                                    <Stack rowGap={"5px"} alignItems={"flex-start"} >
                                        <Typography variant="sm" color={grey[800]}>{algerian_provinces?.[props?.city as any - 1]?.wilaya_name}</Typography>
                                        {props?.codeEnvelope !== "0" ?
                                            (<Typography variant="2xs" color={grey[500]}>{props?.codeEnvelope}</Typography>)
                                            : <Chip label={<Stack direction={"row"} alignItems={"center"} ><Archive size={13} style={{marginLeft: "5px"}} /> {props?.numberBox}</Stack>} style={{fontSize: "14px!important"}}  size={"small"} />
                                        }
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
                        <Typography variant="xs" dir={"rtl"} color={grey[500]}>{`${props?.totalMouny} دج`}</Typography>
                    </Grid>

                    <Grid item>
                        {
                            props?.showClosse && (
                                <Chip size={"medium"} variant="filled" label={props?.codeEnvelope !== "0" ? "مغلق" : "مفتوح"} color="info" customColor={props?.codeEnvelope !== "0" ? red["500"] : green["500"]} rounded={"true"} dir="rtl"></Chip>
                            )
                        }
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                {
                    props?.codeEnvelope === "0" ? (
                        <>
                            <MenuItem onClick={onAddEnvelope} >
                                <ListItemIcon><List size={18} strokeWidth={2} /></ListItemIcon>إغلاق الظرف
                            </MenuItem>

                        </>
                    ) : props?.showClosse ?
                        (
                            <>
                                <MenuItem onClick={onRemoveEnvelope} >
                                    <ListItemIcon><List size={18} strokeWidth={2} /></ListItemIcon>فتح الظرف
                                </MenuItem>

                                <Divider></Divider>

                                <Link href={{pathname: "/envelope", query: {codeEnvelope: props?.codeEnvelope as any}}} passHref>
                                    <a target="_blank">
                                        <MenuItem>
                                            <ListItemIcon><Printer size={18} strokeWidth={2} /></ListItemIcon>
                                            طباعة الظرف
                                        </MenuItem>
                                    </a>
                                </Link>
                            </>
                        )
                        : (
                            <Link href={{pathname: "/envelope", query: {codeEnvelope: props?.codeEnvelope as any}}} passHref>
                                <a target="_blank">
                                    <MenuItem>
                                        <ListItemIcon><Printer size={18} strokeWidth={2} /></ListItemIcon>
                                        طباعة الظرف
                                    </MenuItem>
                                </a>
                            </Link>
                        )
                }



            </Menu>
        </StyledDeliveryCard>
    );
};

export default EnvelopeCard;
