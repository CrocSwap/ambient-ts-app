import styles from './ChatConfirmationPanel.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive: boolean;
    title: string;
    content: string;
    confirmListener?: any;
    cancelListener?: any;
}

export default function ChatConfirmationPanel(props: propsIF) {
    return (
        <div
            className={`
            ${styles.confirmation_wrapper} 
            ${props.isActive ? styles.active : ' '}
        `}
        >
            <div className={styles.title_text}>{props.title}</div>

            <div className={styles.content_text}>{props.content}</div>

            <div className={styles.buttons_section}>
                <div
                    className={styles.btn_wrapper}
                    onClick={() => {
                        props.cancelListener();
                    }}
                >
                    Cancel
                </div>
                <div
                    className={styles.btn_wrapper + ' ' + styles.primary_btn}
                    onClick={() => {
                        props.confirmListener();
                    }}
                >
                    Confirm
                </div>
            </div>
        </div>
    );
}
