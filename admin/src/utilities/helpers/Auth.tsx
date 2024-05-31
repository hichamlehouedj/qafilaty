import React, { FC, FunctionComponent, ReactElement, ReactNode, useEffect } from "react";
import useStore from "../../store/useStore";
import decode from "jwt-decode";
import { useGetCurrentUser, useGetNewToken } from "../../graphql/hooks/users";
import Route, { useRouter } from "next/router";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { REFRESH_TOKEN } from "../../graphql/hooks/users/useGetNewToken";
import { CURRENT_USER } from "../../graphql/hooks/users/useGetCurrentUser";

const useAuth = (client: ApolloClient<NormalizedCacheObject> | undefined) => {
  // const [getCurrentUserLazy]: any = useGetCurrentUser();
  // const [getNewTokenLazy]: any = useGetNewToken();
  // let token = useStore((state: any) => state.token);
  // let userData = useStore((state: any) => state.userData);
  // let userData = useStore.getState()?.userData;
  // let route = useRouter();
  let token = (useStore.getState() as any)?.token;

  let checkAuth = async () => {
    await checkRefreshToken();
    await getCurrentUserData();
    return true;
  };

  let checkRefreshToken = async () => {
    let currentDate = new Date();
    let decodedJWT: any = token && decode(token);

    if (!decodedJWT || decodedJWT.exp * 1000 < currentDate.getTime()) {
      await client
        ?.query({
          query: REFRESH_TOKEN,
          fetchPolicy: "network-only",
        })
        .then(
          ({ data }) => {
            let refreshToken = data?.refreshToken;
            if (refreshToken?.token) {
              useStore.setState({
                isAuth: true,
                token: refreshToken.token,
              });

              if (Route.pathname == "/signin") Route.push("/stocks");
              return;
            }
          },
          (error) => {
            useStore.setState({
              isAuth: false,
              token: "",
            });
            Route.push("/signin");
          }
        );
    }
    // else {
    //   // Route.push("/signin");
    // }
    return true;
  };

  let getCurrentUserData = async () => {
    await client
      ?.query({
        query: CURRENT_USER,
      })
      .then(
        ({ data }) => {
          let currentClient = data?.currentAdmin;
          let numPoints = data?.currentAdmin?.person?.company?.points;
          if (!currentClient) {
            Route.push("/signin");
            useStore.setState({ userData: {} });
          } else {
            useStore.setState({ userData: currentClient, numPoints });
          }
        },
        (err) => {
          useStore.setState({ userData: {} });
        }
      );
  };

  return {
    checkAuth,
    checkRefreshToken,
  };
};

interface Props {
  client?: any;
  children?: any;
}

const ProtectedPage = ({ client, children }: Props): any => {
  // let isAuth = useStore((state: any) => state.isAuth);
  let isAuth = (useStore.getState() as any)?.isAuth;

  const [loading, setloading] = React.useState(true);

  let route = useRouter();

  const { checkAuth } = useAuth(client);

  useEffect(() => {
    (async function () {
      await checkAuth();
      setloading(false);
    })();
  }, []);

  if (!isAuth && loading) return <></>;

  return <>{children}</>;
};

export { useAuth, ProtectedPage };
