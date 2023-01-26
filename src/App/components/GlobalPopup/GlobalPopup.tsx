import styles from './GlobalPopup.module.css';

interface GlobalPopupProps {
    isGlobalPopupOpen: boolean;
    openGlobalPopup: (page: string) => void;
    closeGlobalPopup: () => void;
    currentContent: React.ReactNode;

    title?: string;
}
export default function GlobalPopup(props: GlobalPopupProps) {
    const popupOrNull = props.isGlobalPopupOpen ? (
        <div className={styles.main_popup_container}>
            <header>
                <p />
                <h3>{props.title}</h3>
                <div onClick={props.closeGlobalPopup}>X</div>
            </header>
            <section>{props.currentContent}</section>
        </div>
    ) : null;
    return <>{popupOrNull}</>;
}
