// This component is for handling the styling of outside libraries sych as MaterialUI

import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
    menuItem: {
        backgroundColor: 'red',
    },
}));
