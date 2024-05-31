import {
  Divider,
  ListItemIcon,
  Menu as MuiMenu,
  menuClasses,
  MenuItem,
  menuItemClasses,
  MenuProps,
  StyledComponentProps,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { MUIStyledCommonProps, styled } from "@mui/system";
import { Box, Plus, Trash2 } from "react-feather";

export interface Props extends MenuProps {}

const StyledMenu = styled(MuiMenu)(({ theme, color }: { theme: any; color?: any }) => {
  return {
    ...theme.typography["3xs"],
    color: grey[500],
    [`& .${menuClasses.paper}`]: {
      boxShadow: `${theme.shadows[25].elevation3} !important`,
      overflow: "visible",
      // '&:before': {
      //     content: '""',
      //     display: 'block',
      //     position: 'absolute',
      //     top: 1,
      //     boxShadow: `0px 0.4px 1px 0.8px rgba(0, 0, 0, 0.13)`,
      //     right: 14,
      //     width: 10,
      //     height: 10,
      //     backgroundColor: '#FFF',
      //     transform: 'translateY(-50%) rotate(45deg)',
      //     zIndex: -1,
      //     // borderRadius: 1,
      // },
      [".MuiMenuItem-root"]: {
        ...theme.typography["xs"],
      },
      [`& .${menuItemClasses.root}`]: {
        minHeight: "34px",
        color: grey[700],
        [`& .MuiListItemIcon-root`]: {
          color: grey[700],
        },
      },
    },
  };
});

const Menu = (props: Props) => {
  return (
    <StyledMenu
      // open={true}
      // transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      // anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      {...(props as any)}
      id="MuiStyledMenu"
      PaperProps={{ elevation: 0 }}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    ></StyledMenu>
  );
};

export default Menu;
