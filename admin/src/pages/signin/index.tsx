import { Alert, alpha, Box, Stack, Button as MuiButton, Typography, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LogIn } from "react-feather";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input/Input";
import {
  useAuthenticateClient,
  useGetCurrentUser,
  useResendEmailVerification,
} from "../../graphql/hooks/users";
import useStore from "../../store/useStore";

interface Props {}

const SignIn = (props: Props) => {
  const [authenticateClientMutation, { data }] = useAuthenticateClient();
  const [resendEmailVerficationMutation] = useResendEmailVerification();
  const [getCurrentUserLazy] = useGetCurrentUser();
  const route = useRouter();
  const [email, setEmail] = useState("");
  console.log("🚀 ~ file: index.tsx ~ line 31 ~ signIn ~ route", route);

  const [alert, setAlert] = useState<{
    status?: string;
    msg?: string;
    length?: number;
    code?: string;
  }>({});

  const theme: any = useTheme();

  let {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();

  let onFormSubmit = ({ email, password }: any) => {
    authenticateClientMutation({
      variables: {
        content: {
          email: email,
          password: password,
        },
      },
    }).then(
      ({ data: { authenticateUser } }) => {
        useStore.setState({ token: authenticateUser?.token });
        useStore.setState({ isAuth: true });
        route.push("/stocks");

        getCurrentUserLazy().then(({ data }) => {
          useStore.setState({ userData: data?.currentAdmin, numPoints: data?.currentAdmin?.person?.company?.points });
        });
        // reset({ /* email: "", */ password: "" });
      },
      (err) => {
        setEmail(email);
        reset({ /* email: "", */ password: "" });

        if (
          err?.graphQLErrors[0]?.extensions?.code == "USER_NOT_EXIST" ||
          err?.graphQLErrors[0]?.extensions?.code == "MANAGER_NOT_EXIST"
        ) {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "لا يوجد مستخدم لهاذا الإيميل/ الباسوورد",
          });
        }
        if (err?.graphQLErrors[0]?.extensions?.code == "EMAIL_NOT_VERIFY") {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "هذا الحساب غير مفعل، قم بالتحقق من صندوق البريد لتفعيله.",
          });
        }
        if (err?.graphQLErrors[0]?.extensions?.code == "PASSWORD_INCORRECT") {
          setAlert({
            status: "error",
            msg: " كلمة المرور غير صحيحة، يرجى إعادة المحاولة.",
          });
        }

        if (err?.graphQLErrors[0]?.extensions?.code == "ACCOUNT_NOT_ACTIVE") {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "تم حظر حسابك من قبل المسؤول",
          });
        }

        if (err?.graphQLErrors[0]?.extensions?.code == "NOT_ACCESS_STOCK") {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "حسابك غير مرتبط باي مكتب",
          });
        }

        if (err?.graphQLErrors[0]?.extensions?.code == "STOCK_NOT_ACTIVE") {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "المكتب الذي تنتمي اليه محظور",
          });
        }

        if (err?.graphQLErrors[0]?.extensions?.code == "COMPANY_NOT_ACTIVE") {
          setAlert({
            code: err?.graphQLErrors[0]?.extensions?.code,
            status: "error",
            msg: "الشركة التي تنتمي اليه محظورة",
          });
        }


        if (err?.graphQLErrors[0]?.extensions?.code == "TOO_MANY_REQUESTS") {
          const time = err?.graphQLErrors[0]?.message.split(" ")?.[7] || 100
          console.log(time)

          setAlert({status: "error", msg: `بسبب كثرة المحاولات الخطأة تم حظرك ${time} ثانية`,});
        }
      }
    );
  };

  // Watchers

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: true });
  }, []);

  useEffect(() => {
    if (route.query?.emailVerificationStatus === "true") {
      setAlert({
        msg: "لقد تم تحديث حسابك بنجاح!",
        status: "success",
      });
    }
    if (route.query?.emailVerificationStatus === "false") {
      setAlert({
        msg: "حدث خطأ أثناء تحديث حسابك، يرجى إعادة المحاولة.",
        status: "error",
      });
    }
  }, [route]);

  return (
    <>
      <Head>
        <title>تسجيل الدخول | قافلتي</title>
      </Head>
      <Box
        sx={{
          background: theme.palette?.background.body,
          width: "100%",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box>
          <form id="signin" onSubmit={handleSubmit(onFormSubmit)}>
            <Stack gap={"22px"} alignItems="center">
              <Box component={"img"} height="80px" src="/logo.png" alt="logo"></Box>
              <Typography variant="3xl" sx={{ color: "primary.main" }}>
                تسجيل الدخول
              </Typography>
              <Box
                sx={{
                  padding: { xs: "36px 36px", sm: "36px 44px" },
                  width: { xs: "95vw", sm: "490px" },
                  maxWidth: "490px",
                  background: alpha(theme.palette?.primary.main, "0.04" as any),
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette?.primary.main}`,
                }}
              >
                <Stack gap={"28px"}>
                  {alert.status && (
                    <Alert
                      variant="filled"
                      severity={alert.status as any}
                      sx={{ padding: "4px 16px" }}
                      onClose={() => setAlert({})}
                      action={
                        alert.code == "EMAIL_NOT_VERIFY" && (
                          <Stack height="100%" alignItems="center" direction="row">
                            <MuiButton
                              variant="contained"
                              color="info"
                              size="small"
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
                              // sx={{ flexShrink: 0 }}
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

                  <Typography variant="base" color={grey[800]}>
                    يرجى ادخال الايميل والباسورد الخاص بك.
                  </Typography>
                  <Stack gap={"24px"}>
                    {/* email input */}
                    <Stack gap={"10px"}>
                      <Typography variant="xs" color={grey[800]}>
                        البريد الالكتروني
                      </Typography>
                      <Input fullWidth {...register("email")}></Input>
                    </Stack>
                    {/* password input */}
                    <Stack gap={"10px"}>
                      <Typography variant="xs" color={grey[800]}>
                        كلمة المرور
                      </Typography>
                      <Input type={"password"} fullWidth {...register("password")}></Input>
                      <Typography
                        variant="2xs"
                        sx={{ textDecoration: "underline" }}
                        alignSelf="end"
                      >
                        <Link href={"/signin/reset-password"}>نسيت كلمة المرور؟</Link>
                      </Typography>
                    </Stack>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{ height: "42px" }}
                      endIcon={
                        <LogIn
                          style={{
                            width: "18px !important",
                            height: "18px !important",
                            strokeWidth: "2",
                          }}
                        ></LogIn>
                      }
                    >
                      تسجيل الدخول
                    </Button>
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
