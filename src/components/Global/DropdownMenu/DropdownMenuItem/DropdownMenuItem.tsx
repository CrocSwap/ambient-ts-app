import styles from './DropdownMenuItem.module.css';

interface DropdownMenuItemProps {
    children: React.ReactNode;
}

export default function DropdownMenuItem(props: DropdownMenuItemProps) {
    return <li className={styles.menu_item}>{props.children}</li>;
}
