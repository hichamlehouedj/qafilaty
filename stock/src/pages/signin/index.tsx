import {Alert, alpha, Box, Button as MuiButton, Stack, Typography, useTheme, Link as LinkM} from "@mui/material";
import { grey } from "@mui/material/colors";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LogIn } from "react-feather";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input/Input";
import {useAuthenticateClient, useGetCurrentUser, useResendEmailVerification} from "../../graphql/hooks/users";
import useStore from "../../store/useStore";
import Link from "next/link";

interface Props {}

const SignIn = (props: Props) => {
    const [authenticateClientMutation, { data }] = useAuthenticateClient();
    const [resendEmailVerficationMutation] = useResendEmailVerification();
    const [getCurrentUserLazy] = useGetCurrentUser();
    const route = useRouter();
    const [alert, setAlert] = useState<{
        status?: string;
        msg?: string;
        length?: number;
        code?: string;
    }>({});
    const theme: any = useTheme();
    const [email, setEmail] = useState("");

    let {register, handleSubmit, watch, reset, control, formState: { errors }} = useForm();

    let onFormSubmit = ({ email, password }: any) => {
        authenticateClientMutation({
            variables: {
                content: {email, password}
            }
        }).then(({ data: { authenticateUser } }) => {
            useStore.setState({ token: authenticateUser?.token });
            useStore.setState({ isAuth: true });



            getCurrentUserLazy().then(({ data }) => {
                  useStore.setState({ userData: data?.currentUser });
                  //console.log("file: index.tsx getCurrentUserLazy ~ data?.currentClient", data?.currentUser);
                route.push("/");
            });

            // reset({ /* email: "", */ password: "" });
        }).catch((err) => {
            setEmail(email);
            if (err?.graphQLErrors[0]?.extensions?.code == "USER_NOT_EXIST") {
                setAlert({status: "error", msg: "لا يوجد مستخدم لهاذا الإيميل/ الباسوورد",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "EMAIL_NOT_VERIFY") {
                setAlert({
                    status: "error",
                    msg: "لم يتم التحقق من البريد الالكتروني قم بالتحقق من صندوق البريد لتفعيله.",
                    code: err?.graphQLErrors[0]?.extensions?.code,
                });
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "PASSWORD_INCORRECT") {
                setAlert({status: "error", msg: " كلمة المرور غير صحيحة، يرجى إعادة المحاولة.",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "ACCOUNT_NOT_ACTIVE") {
                setAlert({status: "error", msg: "تم حظر حسابك من قبل المسؤول",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "NOT_ACCESS_STOCK") {
                setAlert({status: "error", msg: "حسابك غير مرتبط باي مكتب",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "STOCK_NOT_ACTIVE") {
                setAlert({status: "error", msg: "المكتب الذي تنتمي اليه محظور",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "COMPANY_NOT_ACTIVE") {
                setAlert({status: "error", msg: "الشركة التي تنتمي اليه محظورة",});
            }

            if (err?.graphQLErrors[0]?.extensions?.code == "TOO_MANY_REQUESTS") {
                const time = err?.graphQLErrors[0]?.message.split(" ")?.[7] || 100
                console.log(time)

                setAlert({status: "error", msg: `بسبب كثرة المحاولات الخطأة تم حظرك ${time} ثانية`,});
            }

        });
    }

    // Watchers
    useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    return (
        <>
            <Head><title>تسجيل الدخول | قافلي</title></Head>

            <Box sx={{background: theme.palette?.background.body, width: "100%", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <Box>
                    <form id="signin" onSubmit={handleSubmit(onFormSubmit)}>
                        <Stack gap={"22px"} alignItems="center">
                            <Box component={"img"} height="66px" src="/logo.png" alt="logo"></Box>
                            <Typography variant="3xl" sx={{ color: "primary.main" }}>تسجيل الدخول</Typography>
                            <Box
                                sx={{padding: "36px 44px", background: alpha(theme.palette?.primary.main, "0.04" as any), borderRadius: "4px", border: `1px solid ${theme.palette?.primary.main}`}}>
                                <Stack gap={"28px"}>
                                    {alert.status && (
                                        <Alert
                                            variant="filled"
                                            severity={alert.status as any}
                                            sx={{ padding: "4px 16px" }}
                                            onClose={() => setAlert({})}
                                            action={
                                                alert?.code == "EMAIL_NOT_VERIFY" && (
                                                    <Stack height="100%" alignItems="center" direction="row">
                                                        <MuiButton variant="contained" color="info" size="small"
                                                            onClick={() => {
                                                                resendEmailVerficationMutation({
                                                                    variables: {
                                                                        email: email,
                                                                    },
                                                                });

                                                                route.push({
                                                                    pathname: "/signin/reset-password-completed",
                                                                    query: {
                                                                        email: email,
                                                                    },
                                                                });
                                                            }}
                                                        >
                                                            <Typography variant="2xs">إعادة ارسال</Typography>
                                                        </MuiButton>
                                                    </Stack>
                                                )
                                            }
                                        >
                                            {alert.msg}
                                        </Alert>
                                    )}
                                    <Typography variant="base" color={grey[800]}>يرجى ادخال الايميل والباسورد الخاص بك.</Typography>

                                    <Stack gap={"24px"}>
                                        {/* email input */}
                                        <Stack gap={"10px"}>
                                            <Typography variant="xs" color={grey[800]}>البريد الالكتروني</Typography>
                                            <Input sx={{ width: "400px" }}{...register("email")}></Input>
                                        </Stack>

                                        {/* password input */}
                                        <Stack gap={"10px"}>
                                            <Typography variant="xs" color={grey[800]}>كلمة المرور</Typography>
                                            <Input type={"password"} sx={{ width: "400px" }}{...register("password")}></Input>
                                            <Link href={{pathname: "/signin/forget"}} passHref>
                                                <LinkM  underline="hover">نسيت كلمة المرور؟</LinkM>
                                            </Link>
                                        </Stack>

                                        {/* Log In Button */}
                                        <Button fullWidth type="submit" variant="contained" sx={{ height: "42px" }}
                                            endIcon={
                                                <LogIn style={{width: "18px !important", height: "18px !important", strokeWidth: "2"}}></LogIn>
                                            }
                                        >تسجيل الدخول</Button>
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

export default SignIn;
