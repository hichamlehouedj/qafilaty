import React, { FC, useEffect } from "react";
import useStore from "../../store/useStore";
import decode from "jwt-decode";
import { useGetCurrentUser, useGetNewToken } from "../../graphql/hooks/users";
import { useRouter } from "next/router";
const useAuth = () => {
    const [getCurrentUserLazy]: any = useGetCurrentUser();
    const [getNewTokenLazy]: any = useGetNewToken();
    let token = useStore((state: any) => state.token);
    let userData = useStore((state: any) => state.userData);
    let route = useRouter();
    //const { id } = route.query


    interface Props {
    children?: any;
}

    let checkAuth = async () => {
        await checkRefreshToken();
        await getCurrentUserData();
    };

    let checkRefreshToken = async () => {
        let currentDate = new Date();
        let decodedJWT: any = token && decode(token);

        if (!decodedJWT || decodedJWT.exp * 1000 < currentDate.getTime()) {
            await getNewTokenLazy({
                onCompleted: ({ refreshToken }: { refreshToken: any }) => {
                    if (refreshToken?.token) {
                        useStore.setState({
                            isAuth: true,
                            token: refreshToken.token,
                        });
                        return;
                    }
                    route.push({ pathname: "/signin" });
                },
            }).catch((error: any) => {
                useStore.setState({isAuth: false, token: ""});
                route.push("/signin");
            });
        } else {
            route.push("/signin");
        }
    };

    let getCurrentUserData = async () => {
        await getCurrentUserLazy({
            onCompleted: (data: any ) => {
                useStore.setState({ userData: data?.currentUser });
                useStore.setState({ numPoints: data?.currentUser?.person?.company?.points });
                //useValidAccessesStock
            },
        }).catch((error: any) => {
            useStore.setState({ userData: {} });
        });
    };

    return {
        checkAuth,
        checkRefreshToken
    };
};

const Protectedpage: FC = (props: any): any => {
    let isAuth = useStore((state: any) => state.isAuth);
    const [loading, setloading] = React.useState(true);

    let route = useRouter();

    //console.log("Protectedpage", route)
    const { checkAuth, checkRefreshToken } = useAuth();

    useEffect(() => {
        (async function () {
            await checkAuth();
            setloading(false);
        })()
    }, []);

    useEffect(() => {
        setInterval(async function () {
            await checkRefreshToken();
            setloading(false);
        }, 1000*60*0.75)
    }, []);

    if (!isAuth && loading) return <></>;

    return <>{props.children}</>;
};

export { useAuth, Protectedpage };
