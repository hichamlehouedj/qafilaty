import Head from "next/head";
import {CircularProgress, Grid,} from "@mui/material";
import React from "react";
import Input from "../Input/Input";
interface Props {}

export const SkeletonBoxModel = (props: Props) => {
    return (
        <Grid container boxSizing={"border-box"} spacing={2} >
            <Grid item width={"100%"} height={"64vh"} display={"flex"} justifyContent="center" alignItems="center" >
                <CircularProgress color="primary" size={60} thickness={3} sx={{animationDuration: "3s"}} />
            </Grid>
        </Grid>
    );
}