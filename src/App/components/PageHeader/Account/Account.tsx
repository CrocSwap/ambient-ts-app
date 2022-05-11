import styles from './Account.module.css';
import { useState, useEffect } from 'react';
import Popover from '@material-ui/core/Popover';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';

export default function Account() {
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const popoverId = open ? 'simple-popover' : undefined;
    return <div>Account</div>;
}
