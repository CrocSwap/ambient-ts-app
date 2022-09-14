import styles from './NotificationTable.module.css';
import { Dispatch, SetStateAction } from 'react';
interface NotificationTableProps {
    showNotificationTable: boolean;
    setShowNotificationTable: Dispatch<SetStateAction<boolean>>;
}
const NotificationTable = (props: NotificationTableProps) => {
    const { showNotificationTable } = props;

    if (!showNotificationTable) return null;
    return (
        <div className={styles.container}>
            <section className={styles.header}>Notifications</section>

            <section className={styles.content}></section>

            <section className={styles.footer}>
                <button>Clear all</button>
            </section>
        </div>
    );
};

export default NotificationTable;
