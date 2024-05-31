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
import jwtDecode from "jwt-decode";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { LogIn } from "react-feather";
import { useForm } from "react-hook-form";
import Button from "../../components/Button";
import Input from "../../components/Input/Input";
// import { useGetNotification } from "../../graphql/hooks/notifications";
import { useAuthenticateClient, useGetCurrentUser } from "../../graphql/hooks/users";
import useStore from "../../store/useStore";

interface Props {}

const VerifyToken = (props: Props) => {
  // const [authenticateClientMutation, { data }] = useAuthenticateClient();
  // const [getCurrentUserLazy] = useGetCurrentUser();
  const route = useRouter();

  // Watchers

  useEffect(() => {
    emailVerificationHandler();
  }, [route.push]);

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: true });
  }, []);

  let emailVerificationHandler = async () => {
    try {
      let token = await jwtDecode(route.query?.token as any);
      let location = window.location;
      if (token) {
        // window.location.replace(`http://${location.host}/login?emailVerificationStatus=true`);
        route.push({
          pathname: "/signin",
          query: {
            emailVerificationStatus: true,
          },
        });
      }
    } catch (error) {
      // window.location.replace(`http://${location.host}/login?emailVerificationStatus=false`);
      route.push({
        pathname: "/signin",
        query: {
          emailVerificationStatus: false,
        },
      });
      // route.push("/login", {});
    }
  };

  return "";
};

export default VerifyToken;
