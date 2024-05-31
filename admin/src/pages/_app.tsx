import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Button, Slide, ThemeProvider } from "@mui/material";
import theme from "../styles/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import Layout from "../components/generated/Layout";
import {ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, NormalizedCacheObject, fromPromise, from,} from "@apollo/client";
import graphql from "../graphql";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "dayjs/locale/ar-dz"; // ES 2015
import useStore from "../store/useStore";
import { setContext } from "@apollo/client/link/context";
import { useEffect, useState } from "react";
// import { Protectedpage, useAuth } from "../utilities/helpers/Auth";
import { ConfigProvider } from "react-avatar";
import { SnackbarProvider } from "notistack";
import avatar_colors from "../styles/theme/avatar_colors";
import SocketClient from "../utilities/lib/socket";
import { useRouter } from "next/router";
import Scanner from "../components/Scanner/Scanner";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { onError } from "@apollo/client/link/error";
import { ProtectedPage, useAuth } from "../utilities/helpers/Auth";

/****| DayJS related code |****/
// import tawkTo from '../utilities/lib/tawk'

dayjs.locale("ar-dz");
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

/****| Theme related code |****/

const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

theme.direction = "rtl";

function RTL(props: any) {
  return <CacheProvider value={cacheRtl}>{props.children}</CacheProvider>;
}

/****| Apollo related code |****/

let client: ApolloClient<NormalizedCacheObject> | undefined = undefined;

const authLink = setContext((_, { headers }) => {
  const token = (useStore.getState() as any).token;

  return {
    headers: {
      ...headers,
      authorization: token ? `${token}` : "",
    },
  };
});

let isRefreshing: boolean;
let pendingRequests: Function[] = [];
const resolvePendingRequests = () => {
  pendingRequests.map((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    const { extensions, path, message, locations } = graphQLErrors[0];

    const { authorization } = operation.getContext().headers;
    if (extensions.code === "UNAUTHENTICATED" && path?.[0] != "refreshToken") {
      let innerForward;
      if (!isRefreshing) {
        isRefreshing = true;
        innerForward = fromPromise(
          useAuth(client)
            .checkRefreshToken()
            .then(() => {
              resolvePendingRequests();
              return true;
            })
            .catch(() => {
              pendingRequests = [];
              return false;
            })
            .finally(() => {
              isRefreshing = false;
            })
        ).filter((value) => Boolean(value));
      } else {
        innerForward = fromPromise(
          new Promise<void>((resolve) => {
            pendingRequests.push(() => resolve());
          })
        );
      }

      return innerForward.flatMap(() => {
        return forward(operation);
      });
    } else {
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
    }
  }
});

const httpLink = createHttpLink({
  uri: "https://rrkpgd2a7f.qafilaty.com/graphql",
  // uri: "https://api.qafilaty.com/graphql",
  credentials: "include",
});

client = new ApolloClient({
  // link: errorLink.concat(authLink.concat(httpLink)),
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  credentials: "include",
  defaultOptions: {},
  // uri: "https://api.qafilaty.com/graphql",
});

/****| Snackbar configs |****/

const defaultSnackbarProps = {
    maxSnack: 2,
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "right",
    },
    autoHideDuration: 3000,
    // @ts-ignore
    TransitionComponent: (props) => <Slide {...props} direction="right" />,
};

function MyApp({ Component, pageProps }: AppProps) {
    const isLayoutDisabled = useStore((state: any) => state.isLayoutDisabled);
    const userData = useStore((state: any) => state.userData);
    // const [isUserDataAvailable] = useState(userData);
    useEffect(() => {
        if (Object.keys(userData ?? {}).length) {
            console.log("🚀 ~ file: _app.tsx ~ line 86 ~ MyApp ~ userData", userData);
            const socket = new SocketClient({
                client_id: "",
                stock_id: userData?.person?.list_stock_accesses?.stock?.id,
                user_id: userData?.id,
                user_username: userData?.user_name,
            });
            socket.connect(client);
        }

        // return () => {
        //   socket.disconnect();
        // };
    }, [userData]);

    // Start of Tawk.to Script
    useEffect(() => {
        let Tawk_API = "61cce15e80b2296cfdd44d33" || {};
        let Tawk_LoadStart = new Date();
        let s1=document.createElement("script");
        let s0=document.getElementsByTagName("script")[0];

        s1.async = true;
        s1.src='https://embed.tawk.to/61cce15e80b2296cfdd44d33/1fo450msl';
        //s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        // @ts-ignore
        s0.parentNode.insertBefore(s1,s0);

    }, []);

  return (
    <RTL>
      <MUIThemeProvider theme={theme}>
        <ApolloProvider client={client as any}>
          <ProtectedPage client={client}>
            <SnackbarProvider {...(defaultSnackbarProps as any)}>
              <ConfigProvider colors={avatar_colors}>
                <DndProvider backend={HTML5Backend}>
                  <Layout disabled={isLayoutDisabled}>
                    {/* <Scanner></Scanner> */}
                    <Component {...pageProps} />
                  </Layout>
                </DndProvider>
              </ConfigProvider>
            </SnackbarProvider>
          </ProtectedPage>
        </ApolloProvider>
      </MUIThemeProvider>
    </RTL>
  );
}

export default MyApp;