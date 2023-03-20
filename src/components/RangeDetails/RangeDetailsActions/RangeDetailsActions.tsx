import { useState } from 'react';
import styles from './RangeDetailsActions.module.css';
import { IoMdRemoveCircleOutline } from 'react-icons/io';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import { GiFarmer } from 'react-icons/gi';
import { BiCopy } from 'react-icons/bi';
import { FiEdit } from 'react-icons/fi';
import { MdTravelExplore } from 'react-icons/md';
import { BsPlusCircleFill } from 'react-icons/bs';

// interface RangeDetailsActionsPropsIF {
//     children: ReactNode;
// }

export default function RangeDetailsActions() {
    const [showMenuItems, setShowMenuItems] = useState(false);

    const menuButton = (
        <div className={styles.menu_button} onClick={() => setShowMenuItems(!showMenuItems)}>
            <BsPlusCircleFill size={50} />
        </div>
    );

    const wrapperStyle = showMenuItems ? styles.menu_wrapper_active : styles.menu_wrapper;

    const actionItems = (
        <div className={styles.action_items}>
            <IconWithTooltip placement='left' title='Remove'>
                <IoMdRemoveCircleOutline size={30} />
            </IconWithTooltip>
            <IconWithTooltip placement='left' title='Harvest'>
                {' '}
                <GiFarmer size={27} />
            </IconWithTooltip>
            <IconWithTooltip placement='left' title='Copy Trade'>
                <BiCopy size={27} />
            </IconWithTooltip>
            <IconWithTooltip placement='left' title='Edit'>
                {' '}
                <FiEdit size={27} />
            </IconWithTooltip>
            <IconWithTooltip placement='left' title='Explorer'>
                {' '}
                <MdTravelExplore size={30} />
            </IconWithTooltip>
        </div>
    );

    return (
        <div className={styles.container}>
            {menuButton}
            <div className={wrapperStyle}>{actionItems}</div>
        </div>
    );
}
