import { Box, Stack, Typography } from "@mui/material";
import React from "react";

interface Props {
  title: string;
}

const EmptyStat = (props: Props) => {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        justifyContent: "center",
        marginTop: "-20px",
      }}
    >
      <Stack rowGap={"10px"}>
        <Box
          component={"img"}
          src="/empty.svg"
          marginRight="auto"
          marginLeft="auto"
          //   height={"100px"}
          sx={{ maxHeight: { xs: "100px", md: "125px" } }}
          alt="empty"
        >
          {/* <img
            src="/empty.svg"
            
          ></img> */}
        </Box>

        <Typography
          //   variant="xl"
          sx={{
            color: "#B3B9CC",
            typography: {
              xs: "lg",
              md: "xl",
            },
          }}
        >
          {props.title}
        </Typography>
      </Stack>
    </Box>
  );
};

export default EmptyStat;
