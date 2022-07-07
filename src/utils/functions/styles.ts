// This component is for handling the styling of outside libraries sych as MaterialUI

// 1. To use the component, delcare the materialUI item you want to style.
// 2. Add the styling to the item as if you were creating an inline style
// 3. In the component, where you are using the item, import the useStyle function as such:
// import { useStyles } from '../../../utils/functions/styles';
// 4. Assign the useStyle function to a variable such as 'classess:
// const classes = useStyles();
// 5. For the className of the item, simply target the item styling from the useStyles:
// <MenuItem onClick={handleClose} className={classes.menuItem}> Profile</MenuItem>

// Resource : https://stackoverflow.com/questions/61023797/how-to-change-the-color-of-menu-in-material-ui

import { makeStyles } from '@material-ui/core';
// export const useStyles = makeStyles((theme: Theme)
export const useStyles = makeStyles(() => ({
    menuItem: {
        backgroundColor: '#171D27',
        color: '#BDBDBD',
        '&:hover': {
            color: '#ffffff',
        },
        fontSize: '12px',
        lineHeight: '15px',
    },
    menu: {
        '& .MuiPaper-root': {
            backgroundColor: '#12171f',
        },
    },
}));
