import {Alert, alpha, Box, Link as LinkM, Stack, Typography, useTheme} from "@mui/material";
import { grey } from "@mui/material/colors";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LogIn } from "react-feather";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input/Input";
import {useForgetPassword} from "../../graphql/hooks/users";
import useStore from "../../store/useStore";
import Link from "next/link";

interface Props {}

const ForgetPassword = (props: Props) => {
    const [forgetPassword] = useForgetPassword();
    const route = useRouter();
    const [alert, setAlert] = useState<{
        status?: string;
        msg?: string;
        length?: number;
    }>({});

    const theme: any = useTheme();

    let {register, handleSubmit, watch, reset, control, formState: { errors }} = useForm();

    let onFormSubmit = ({ email }: any) => {
        forgetPassword({
            variables: {
                email: email || ""
            }
        }).then(({ data: { forgetPassword } }) => {
            setAlert({status: "success", msg: `تم ارسال رسالة التحقق الى ${email} تاكد من صندوق الرسائل لديك`});
        }).catch((err) => {
            if (err?.graphQLErrors[0]?.extensions?.code == "USER_NOT_EXIST") {
                setAlert({status: "error", msg: "لا يوجد مستخدم مرتبط بهذا البريد الالكتروني",});
            }
        });
    }

    // Watchers
    useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    return (
        <>
            <Head><title>نسيت كلمة المرور | قافلي</title></Head>

            <Box sx={{background: theme.palette?.background.body, width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Box>
                    <form id="signin" onSubmit={handleSubmit(onFormSubmit)}>
                        <Stack gap={"22px"} alignItems="center">
                            <Box component={"img"} height="66px" src="/logo.svg" alt="logo"></Box>
                            <Typography variant="3xl" sx={{ color: "primary.main" }}>تسجيل الدخول</Typography>

                            {alert.status && (<Alert variant="outlined"  severity={alert.status as any} sx={{ padding: "4px 16px" }} onClose={() => setAlert({})}>{alert.msg}</Alert>)}

                            <Box
                                sx={{padding: "36px 44px", background: alpha(theme.palette?.primary.main, "0.04" as any), borderRadius: "4px", border: `1px solid ${theme.palette?.primary.main}`}}>
                                <Stack gap={"28px"}>
                                    <Typography variant="xs" color={grey[800]}>يرجى ادخال الايميل ليتم ارسال رابط اعادة تعيين كلمة المرور</Typography>

                                    <Stack gap={"24px"}>
                                        {/* email input */}
                                        <Stack gap={"10px"}>
                                            <Typography variant="xs" color={grey[800]}>البريد الالكتروني</Typography>
                                            <Input sx={{ width: "400px" }}{...register("email")}></Input>
                                        </Stack>
                                        <Link href={{pathname: "/signin"}} passHref>
                                            <LinkM  underline="hover">تسجيل الدخول</LinkM>
                                        </Link>

                                        {/* Log In Button */}
                                        <Button fullWidth type="submit" variant="contained" sx={{ height: "42px" }}
                                            endIcon={
                                                <LogIn style={{width: "18px !important", height: "18px !important", strokeWidth: "2"}}></LogIn>
                                            }
                                        >إرسال</Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Stack>
                    </form>
                </Box>
            </Box>
        </>
    );
};

export default ForgetPassword;
