import styles from './GlobalPopup.module.css';
import { VscClose } from 'react-icons/vsc';
interface GlobalPopupProps {
    isGlobalPopupOpen: boolean;
    openGlobalPopup: (page: string) => void;
    closeGlobalPopup: () => void;
    popupContent: React.ReactNode;

    popupTitle?: string;
    placement: string | 'left' | 'center' | 'right';
}
export default function GlobalPopup(props: GlobalPopupProps) {
    const showGlobalPopupStyle = props.isGlobalPopupOpen
        ? styles.global_popup_active
        : styles.global_popup;
    const placementStyle =
        props.placement === 'left'
            ? styles.popup_left
            : props.placement === 'center'
            ? styles.popup_center
            : props.placement === 'right'
            ? styles.popup_right
            : styles.popup_right;

    // const popupOrNull = props.isGlobalPopupOpen ? (
    //     <div className={styles.main_popup_container}>
    //         <header>
    //             <p />
    //             <h3>{props.popupTitle}</h3>
    //             <div onClick={props.closeGlobalPopup}>X</div>
    //         </header>
    //         <section>{props.popupContent}</section>
    //     </div>
    // ) : null;

    return (
        <div className={`${showGlobalPopupStyle} ${placementStyle} ${styles.container}`}>
            <header>
                <p />
                <h3>{props.popupTitle}</h3>
                <div onClick={props.closeGlobalPopup}>
                    <VscClose size={18} />
                </div>
            </header>
            <section>{props.popupContent}</section>
        </div>
    );
}
