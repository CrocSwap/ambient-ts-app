import styles from './DropdownMenuItem.module.css';

interface DropdownMenuItemProps {
    children: React.ReactNode;
}

export default function DropdownMenuItem(props: DropdownMenuItemProps) {
    return <div className={styles.row}>{props.children}</div>;
}
