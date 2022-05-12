import styles from 'Modal.module.css';

interface ModalProps {
    children: React.ReactNode;
}

export default function Modal(props: ModalProps) {
    return <div className={styles.row}>{props.children}</div>;
}
