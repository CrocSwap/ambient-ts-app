import styles from './GlobalPopup.module.css';
import { VscClose } from 'react-icons/vsc';
import { useContext } from 'react';
import { AppStateContext } from '../../../contexts/AppStateContext';

export default function GlobalPopup() {
    const {
        globalPopup: { isOpen, close, title, content, placement },
    } = useContext(AppStateContext);
    const showGlobalPopupStyle = isOpen
        ? styles.global_popup_active
        : styles.global_popup;
    const placementStyle =
        placement === 'left'
            ? styles.popup_left
            : placement === 'center'
            ? styles.popup_center
            : placement === 'right'
            ? styles.popup_right
            : styles.popup_right;

    return (
        <div
            className={`${showGlobalPopupStyle} ${placementStyle} ${styles.container}`}
        >
            <header>
                <p />
                <h3>{title}</h3>
                <div onClick={close}>
                    <VscClose size={18} />
                </div>
            </header>
            <section>{content}</section>
        </div>
    );
}
