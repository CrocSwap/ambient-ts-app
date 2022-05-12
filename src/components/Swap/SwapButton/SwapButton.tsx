import styles from './SwapButton.module.css';

interface SwapButtonProps {
    children: React.ReactNode;
}

export default function SwapButton(props: SwapButtonProps) {
    return <div className={styles.row}>{props.children}</div>;
}
