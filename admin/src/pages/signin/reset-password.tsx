import {
  Alert,
  alpha,
  Box,
  Stack,
  Theme,
  ThemeOptions,
  ThemeWithProps,
  Typography,
  useTheme,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LogIn } from "react-feather";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input/Input";
import useForgetPassword from "../../graphql/hooks/users/useForgetPassword";
// import { useGetNotification } from "../../graphql/hooks/notifications";
import { useAuthenticateClient, useGetCurrentUser } from "../../graphql/hooks/users";
import useStore from "../../store/useStore";

interface Props {}

const ResetPassword = (props: Props) => {
  const [forgetPWMutation, { data }] = useForgetPassword();
  const [getCurrentUserLazy] = useGetCurrentUser();
  const route = useRouter();
  const [alert, setAlert] = useState<{
    status?: string;
    msg?: string;
    length?: number;
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

  let onFormSubmit = ({ email }: any) => {
    forgetPWMutation({
      variables: {
        email: email,
      },
    }).then(
      (data) => {
        route.push({
          pathname: "/signin/reset-password-completed",
          query: {
            email: email,
          },
        });
      },
      (err) => {
        if (
          err?.graphQLErrors[0]?.extensions?.code == "USER_NOT_EXIST" ||
          err?.graphQLErrors[0]?.extensions?.code == "MANAGER_NOT_EXIST"
        ) {
          setAlert({
            status: "error",
            msg: "لا يوجد مستخدم لهاذا الإيميل/ الباسوورد",
          });
        }
        if (err?.graphQLErrors[0]?.extensions?.code == "EMAIL_NOT_VERIFIED") {
          setAlert({
            status: "error",
            msg: "هذا الحساب غير مفعل، قم بالتحقق من صندوق البريد لتفعيله.",
          });
        }
        if (err?.graphQLErrors[0]?.extensions?.code == "PASSWORD_NOT_CORRECT") {
          setAlert({
            status: "error",
            msg: " كلمة المرور غير صحيحة، يرجى إعادة المحاولة.",
          });
        }
      }
    );
  };

  // Watchers

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: true });
  }, []);

  return (
    <>
      <Head>
        {/* <title>ﺗﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور</title> */}
        <title>ﺗﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور | قافلتي</title>
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
              <Box component={"img"} height="66px" src="/logo.png" alt="logo"></Box>
              <Typography variant="3xl" sx={{ color: "primary.main" }}>
                ﺗﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور
              </Typography>
              <Box
                sx={{
                  padding: { xs: "36px 36px", sm: "36px 44px" },

                  background: alpha(theme.palette?.primary.main, "0.04" as any),
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette?.primary.main}`,
                  width: { xs: "95vw", sm: "490px" },
                  maxWidth: "490px",
                }}
              >
                <Stack gap={"28px"}>
                  {alert.status && (
                    <Alert
                      variant="filled"
                      severity={alert.status as any}
                      sx={{ padding: "4px 16px" }}
                      onClose={() => setAlert({})}
                    >
                      {alert.msg}
                    </Alert>
                  )}

                  <Typography variant="base" color={grey[800]}>
                    ﻟﺘﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور، ﻳﺮﺟﻰ إدﺧﺎل إﻳﻤﻴﻠﻚ اﻟﻤﺴﺠﻞ.
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

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      sx={{ height: "42px" }}
                      // endIcon={
                      //   <LogIn
                      //     style={{
                      //       width: "18px !important",
                      //       height: "18px !important",
                      //       strokeWidth: "2",
                      //     }}
                      //   ></LogIn>
                      // }
                    >
                      ﺗﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <Typography variant="2xs" sx={{ color: grey[700] }}>
                اﻟﺮﺟﻮع اﻟﻰ ﺻﻔﺤﺔ{" "}
                <Typography
                  variant="2xs"
                  sx={{ color: grey[700], fontWeight: "500", textDecoration: "underline" }}
                >
                  <Link href={"/signin"}>تسجيل الدخول</Link>
                </Typography>
              </Typography>
            </Stack>
          </form>
        </Box>
      </Box>
    </>
  );
};

export default ResetPassword;
