import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
    children: React.ReactNode;
}

export default function DropdownMenu(props: DropdownMenuProps) {
    return <div className={styles.row}>{props.children}</div>;
}
