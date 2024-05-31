import "../styles/globals.css";
import "dayjs/locale/ar-dz";
import type { AppProps } from "next/app";
import { Slide } from "@mui/material";
import theme from "../styles/theme";
import { ThemeProvider as MUIThemeProvider } from "@mui/material/styles";
import Layout from "../components/generated/Layout";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, gql } from "@apollo/client";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useStore from "../store/useStore";
import { setContext } from "@apollo/client/link/context";
import { useEffect, useState } from "react";
import { Protectedpage } from "../utilities/helpers/Auth";
import { ConfigProvider } from "react-avatar";
import { SnackbarProvider } from "notistack";
import avatar_colors from "../styles/theme/avatar_colors";
import SocketClient from "../utilities/lib/socket";
import { useRouter } from "next/router";
dayjs.locale("ar-dz");
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

// Create rtl cache
const cacheRtl = createCache({
    key: "muirtl",
    stylisPlugins: [prefixer, rtlPlugin],
});

function RTL(props: any) {
    return <CacheProvider value={cacheRtl}>{props.children}</CacheProvider>;
}

const authLink = setContext((_, { headers }) => {
    const token = (useStore.getState() as any).token;
    return {
        headers: {
            ...headers,
            authorization: token ? `${token}` : "",
        },
    };
});

const httpLink = createHttpLink({
    uri: "https://rrkpgd2a7f.qafilaty.com/graphql",
    // uri: "https://api.qafilaty.com/graphql",
    credentials: "include",
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    credentials: "include"
});

theme.direction = "rtl";

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
    const [isUserDataAvailable] = useState(userData);
    let route = useRouter();
    // console.log("userData ", userData)
    useEffect(() => {
        // console.log("ENV", process.env.NEXT_PUBLIC_API_URL)
        if (Object.keys(userData ?? {}).length > 0) {
            //console.log("🚀 ~ file: _app.tsx ~ line 86 ~ MyApp ~ userData", userData);
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

    return (
        <RTL>
            <MUIThemeProvider theme={theme}>
                <ApolloProvider client={client}>
                    <Protectedpage>
                        <SnackbarProvider {...(defaultSnackbarProps as any)}>
                            <ConfigProvider colors={avatar_colors}>
                                <Layout disabled={isLayoutDisabled}>
                                    <Component {...pageProps} />
                                </Layout>
                            </ConfigProvider>
                        </SnackbarProvider>
                    </Protectedpage>
                </ApolloProvider>
            </MUIThemeProvider>
        </RTL>
    );
}

export default MyApp;
