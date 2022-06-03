import styles from './ConfirmLimitModal.module.css';

interface ConfirmLimitModalProps {
    children: React.ReactNode;
}

export default function ConfirmLimitModal(props: ConfirmLimitModalProps) {
    return <div className={styles.row}>{props.children}</div>;
}
