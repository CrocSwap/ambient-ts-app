import styles from './TxButton.module.css';
import { LuLeaf, LuPencil, LuWallet, LuWheat } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { RxDotsHorizontal } from 'react-icons/rx';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { MdShare } from 'react-icons/md';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { PiArrowFatLineDownBold } from 'react-icons/pi';
import { btnIconNameType } from './TransactionRow2';
import { TransactionIF } from '../../../../ambient-utils/types';

interface propsIF {
    width: number;
    iconName: btnIconNameType;
    hide: boolean;
    onMenuToggle?: () => void;
    tx: TransactionIF;
}

export default function TxButton(props: propsIF) {
    const { width, iconName, hide, onMenuToggle } = props;

    const handleButtonClick = () => {
        onMenuToggle ? onMenuToggle() : alert(iconName);
    };

    let icon: JSX.Element;
    switch (iconName) {
        case 'overflowBtn':
            icon = <RxDotsHorizontal size={12} />;
            break;
        case 'editBtn':
            icon = <LuPencil size={12} />;
            break;
        case 'harvestBtn':
            icon = <LuWheat size={12} />;
            break;
        case 'addBtn':
            icon = <FaPlus size={12} />;
            break;
        case 'removeBtn':
            icon = <FaTimes size={12} />;
            break;
        case 'leafBtn':
            icon = <LuLeaf size={12} />;
            break;
        case 'shareBtn':
            icon = <MdShare size={12} />;
            break;
        case 'exportBtn':
            icon = <BsBoxArrowUpRight size={12} />;
            break;
        case 'walletBtn':
            icon = <LuWallet size={12} />;
            break;
        case 'copyBtn':
            icon = <FiCopy size={12} />;
            break;
        case 'downloadBtn':
            icon = <PiArrowFatLineDownBold size={12} />;
            break;
    }

    // top-level wrapper allows the button to be removed from the DOM but space maintained
    // middle wrapper is how we get the icon
    return (
        <div style={{ width: width }} className={styles.tx_button_wrapper}>
            {hide || (
                <div className={styles.tx_button} onClick={handleButtonClick}>
                    {icon}
                </div>
            )}
        </div>
    );
}
