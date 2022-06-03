import styles from './Snackbar.module.css';

interface SnackbarProps {
    children: React.ReactNode;
}

export default function Snackbar(props: SnackbarProps) {
    return <div className={styles.row}>{props.children}</div>;
}
