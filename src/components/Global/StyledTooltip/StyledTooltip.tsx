import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

export const DefaultTooltip = withStyles({
    tooltip: {
        color: '#ffffff',
        backgroundColor: 'var(--dark3)',
        zIndex: 999,
    },
    arrow: {
        color: '#171d27',
        zIndex: 999,
    },
})(Tooltip);

export const TextOnlyTooltip = withStyles({
    tooltip: {
        color: '#ffffff',
        backgroundColor: 'var(--dark3)',
        zIndex: 999,
    },
})(Tooltip);

export const NoColorTooltip = withStyles({
    tooltip: {
        backgroundColor: 'transparent',
    },
})(Tooltip);

export const GreenTextTooltip = withStyles({
    tooltip: {
        color: 'green',
        backgroundColor: 'transparent',
        fontSize: '.8rem',
    },
})(Tooltip);

export const RedTextTooltip = withStyles({
    tooltip: {
        color: 'red',
        backgroundColor: 'transparent',
        fontSize: '.8rem',
    },
})(Tooltip);

//   https://stackoverflow.com/questions/36759985/how-to-style-mui-tooltip
