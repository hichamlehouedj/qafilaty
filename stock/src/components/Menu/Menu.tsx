import {Menu as MuiMenu, menuClasses, menuItemClasses, MenuProps,} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";

export interface Props extends MenuProps {}

const StyledMenu = styled(MuiMenu)(({ theme, color }: { theme: any; color?: any }) => {
    return {
        ...theme.typography["3xs"],
        color: grey[500],
        [`& .${menuClasses.paper}`]: {
            boxShadow: `${theme.shadows[25].elevation3} !important`,
            overflow: "visible",
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
