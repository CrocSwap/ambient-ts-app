import styles from './TxButton.module.css';
import { LuLeaf, LuPencil, LuWallet, LuWheat } from 'react-icons/lu';
import { FiCopy } from 'react-icons/fi';
import { RxDotsHorizontal } from 'react-icons/rx';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import { MdShare } from 'react-icons/md';
import { FaPlus, FaTimes } from 'react-icons/fa';
import { btnIconNameType } from './TransactionRow2';

interface propsIF {
    width: number;
    iconName: btnIconNameType;
    hide: boolean;
}

export default function TxButton(props: propsIF) {
    const { width, iconName, hide } = props;
    false && width;
    let icon: JSX.Element;
    switch (iconName) {
        case 'dots':
            icon = <RxDotsHorizontal size={12} />;
            break;
        case 'pencil':
            icon = <LuPencil size={12} />;
            break;
        case 'wheat':
            icon = <LuWheat size={12} />;
            break;
        case 'plus':
            icon = <FaPlus size={12} />;
            break;
        case 'multiply':
            icon = <FaTimes size={12} />;
            break;
        case 'leaf':
            icon = <LuLeaf size={12} />;
            break;
        case 'share':
            icon = <MdShare size={12} />;
            break;
        case 'export':
            icon = <BsBoxArrowUpRight size={12} />;
            break;
        case 'wallet':
            icon = <LuWallet size={12} />;
            break;
        case 'copy':
            icon = <FiCopy size={12} />;
            break;
    }
    return (
        <div className={styles.tx_button_wrapper}>
            {hide || <div className={styles.tx_button}>
                {icon}
            </div>}
        </div>
    );
}