import { Box, CardActionArea, Tooltip, TooltipProps, Typography } from "@mui/material";
import { BoxProps, styled } from "@mui/system";
import clsx from "clsx";
import React, { FC, useState } from "react";
import { Home, Plus } from "react-feather";

interface Props extends BoxProps {
  selected?: boolean;
  title?: string;
}

const NavbarItem: FC<Props> = (props) => {
  return (
    <Tooltip
      title={<div style={{ fontSize: 12 }}>{props.title}</div>}
      placement="right"
      PopperProps={{
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 14],
            },
          },
        ],
      }}
    >
      <Box onClick={props.onClick} className={clsx("List-item", { selected: props.selected })}>
        <CardActionArea>
          <Box className={clsx("List-item--innerItem selected")}>{props.children}</Box>
        </CardActionArea>
      </Box>
    </Tooltip>
  );
};

export default NavbarItem;
