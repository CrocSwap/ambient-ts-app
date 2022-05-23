import styles from './Position.module.css';

interface PositionProps {
    children: React.ReactNode;
}

export default function Position(props: PositionProps) {
    return <div className={styles.Position}>{props.children}</div>;
}
