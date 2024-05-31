import { Alert, alpha, Box, Stack, Typography, useTheme } from "@mui/material";
import { grey } from "@mui/material/colors";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthenticateClient, useGetCurrentUser } from "../../graphql/hooks/users";
import useStore from "../../store/useStore";

interface Props {}

const ResetPasswordCompleted = (props: Props) => {
  const [authenticateClientMutation, { data }] = useAuthenticateClient();
  const [getCurrentUserLazy] = useGetCurrentUser();
  const route = useRouter();
  const [alert, setAlert] = useState<{
    status?: string;
    msg?: string;
    length?: number;
  }>({});
  const theme: any = useTheme();

  let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();

  let onFormSubmit = ({ email, password }: any) => {

  };

  // Watchers

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: true });
  }, []);

  if (!route?.query?.email) return "";

  return (
    <>
      <Head>
        <title>ﻟﻘﺪ ﺗﻢ إرﺳﺎل اﻟﺘﺄﻛﻴﺪ | قافلتي</title>
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
              <Typography variant="3xl" sx={{ color: "primary.main" }}>ﻟﻘﺪ ﺗﻢ إرﺳﺎل اﻟﺘﺄﻛﻴﺪ</Typography>
              <Box
                sx={{
                  padding: { xs: "36px 36px", sm: "36px 44px" },

                  background: alpha(theme.palette?.primary.main, "0.04" as any),
                  borderRadius: "4px",
                  border: `1px solid ${theme.palette?.primary.main}`,
                  width: { xs: "95vw", sm: "510px" },
                  maxWidth: "510px",
                }}
              >
                <Stack gap={"28px"}>
                  {alert.status && (
                    <Alert variant="filled" severity={alert.status as any} sx={{ padding: "4px 16px" }} onClose={() => setAlert({})}>{alert.msg}</Alert>
                  )}
                  <Box component={"img"} src="/mailbox.svg" width="250px" margin="0 auto"></Box>
                  <Typography variant="sm" color={grey[800]} lineHeight={"140%"}>
                    ﻳﺮﺟﻰ اﻟﺘﺤﻘﻖ ﻣﻦ ﺻﻨﺪوق اﻟﺒﺮﻳﺪ واﺗﺒﻊ اﻟﺘﻌﻠﻴﻤﺎت ﻟﺘﻐﻴﻴﺮ ﻛﻠﻤﺔ اﻟﻤﺮور، ﺗﻢ إرﺳﺎل اﻟﺘﺄﻛﻴﺪ
                    ﻋﺒﺮ اﻟﺒﺮﻳﺪ اﻟﺈﻟﻜﺘﺮوﻧﻲ اﻟﻰ:
                  </Typography>
                  <Stack gap={"24px"}>
                    <Typography variant="xs" sx={{color: "primary.main", fontWeight: "500", margin: "0 auto",}}>
                      {route?.query?.email}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
              <Typography variant="2xs" sx={{ color: grey[700] }}>
                اﻟﺮﺟﻮع اﻟﻰ ﺻﻔﺤﺔ{" "}
                <Typography variant="2xs" sx={{ color: grey[700], fontWeight: "500", textDecoration: "underline" }}>
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

export default ResetPasswordCompleted;
