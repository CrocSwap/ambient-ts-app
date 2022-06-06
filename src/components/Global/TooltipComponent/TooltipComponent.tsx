import styles from './TooltipComponent.module.css';

interface TooltipComponentProps {
    children: React.ReactNode;
}

export default function TooltipComponent(props: TooltipComponentProps) {
    return <div className={styles.row}>{props.children}</div>;
}
