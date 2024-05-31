import {Box, Container, Grid, IconButton, Stack, Divider, Typography} from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";
import Button from "../components/Button";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import Image from "next/image";
import useStore from "../store/useStore";
import theme from "../styles/theme";
import { ContentRefContext } from "../components/generated/Content";
import {default as RAvatar} from "react-avatar";
import {green, grey, lightGreen} from "@mui/material/colors";
import {bindTrigger} from "material-ui-popup-state/hooks";
import {Check, Copy, MoreHorizontal} from "react-feather";
import {default as copyToClipoard} from "copy-to-clipboard";
import Chip from "../components/Chip/Chip";
import PlanCard from "../components/generated/PlanCard";
import UpdatePlanModal from "../components/Modal/UpdatePlanModal";
import AddPlanModal from "../components/Modal/AddPlanModal";
import PlusCard from "../components/generated/PlusCard";

interface Props {}

const plans = [
    {
        id: "1",
        image: "/vip1.png",
        title: "عملاء مميزون",
        description: "خطة خاصة بالعملاء المميزون كل عميل يحصل على خصم على الطرود الراجعة 50%",
        show: true
    },

    {
        id: "2",
        image: "/vip2.png",
        title: "عملاء VIP",
        description: "خطة خاصة بالعملاء ال VIP كل عميل يحصل على خصم على الطرود الراجعة 50%",
        show: true
    },

    // {
    //     id: "3",
    //     image: "/vip3.png",
    //     title: "عملاء VIP PRO",
    //     description: "خطة خاصة بالعملاء ال VIP PRO كل عميل يحصل على خصم على الطرود الراجعة 50%",
    //     show: false
    // }
]

export default function Home({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openUpdatePlanModal, setOpenUpdatePlanModal] = React.useState(false);
    const [openAddPlanModal, setOpenAddPlanModal] = React.useState(false);
    const [tab2value, setTab2value] = React.useState(0);
    const [allPlansData, setAllPlansData] = React.useState<object[]>([]);
    const [planData, setPlanData] = React.useState<object>({});

    // context
    const contentRef = useContext(ContentRefContext);

    // handlers
    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
        useStore.setState({ subPageTab: null });
    }, []);

    return (
        <>
            <Head><title>الخطط | قافلتي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%" }}>
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2}>
                        {/* content window */}
                        <Grid container xs={12} paddingBottom="32px" justifyContent={"center"} >
                            {plans.map((plan: any, index: number) => (
                                <Grid item marginBottom={5} xs={11} sm={6} md={4} lg={3} justifyContent={"center"}>
                                    <PlanCard
                                        id={plan.id}
                                        image={plan.image}
                                        title={plan.title}
                                        description={plan.description}
                                        show={plan.show}
                                        setPlanData={setPlanData}
                                        setOpenUpdatePlanModal={setOpenUpdatePlanModal}
                                    />
                                </Grid>
                            ))}

                            {plans.length < 3 ?
                                <Grid item marginBottom={5} xs={11} sm={6} md={4} lg={3} justifyContent={"center"}>
                                    <PlusCard setOpenAddPlanModal={setOpenAddPlanModal} />
                                </Grid>
                                : null
                            }
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Add Plan */}
            <AddPlanModal open={openAddPlanModal} onClose={() => setOpenAddPlanModal(false)} />

            {/* Update Plan */}
            <UpdatePlanModal plan={planData} open={openUpdatePlanModal} onClose={() => setOpenUpdatePlanModal(false)} />
        </>
    );
}
