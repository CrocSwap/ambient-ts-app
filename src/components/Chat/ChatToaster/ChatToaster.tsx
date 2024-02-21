import {
    AiOutlineCheck,
    AiOutlineClose,
    AiOutlineInfoCircle,
    AiOutlineWarning,
} from 'react-icons/ai';
import styles from './ChatToaster.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    activator: (active: boolean) => void;
    type?: 'success' | 'error' | 'warning' | 'info';
    text: string;
}

export default function ChatToaster(props: propsIF) {
    if (props.isActive) {
        setTimeout(() => {
            props.activator(false);
        }, 2000);
    }

    const typeSelector = props.type ? props.type : 'info';

    const iconSize = 18;

    const renderIcon = () => {
        switch (props.type) {
            case 'success':
                return <AiOutlineCheck size={iconSize} />;
            case 'error':
                return <AiOutlineClose size={iconSize} />;
            case 'warning':
                return <AiOutlineWarning size={iconSize} />;
            default:
                return <AiOutlineInfoCircle size={iconSize} />;
        }
    };

    return (
        <div
            className={`
            ${styles.toastr_wrapper} 
            ${props.isActive ? styles.active : ' '}
            ${styles[typeSelector]}
        `}
            onClick={() => {
                props.activator(false);
            }}
        >
            <div className={styles.toastr_icon + ' ' + styles[typeSelector]}>
                {renderIcon()}
            </div>
            <div className={styles.text}>{props.text}</div>
        </div>
    );
}
