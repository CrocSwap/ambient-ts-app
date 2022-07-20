import styles from './DropdownMenu.module.css';

interface DropdownMenuProps {
    children: React.ReactNode;
}

export default function DropdownMenu(props: DropdownMenuProps) {
    return <li className={styles.menu_item}>{props.children}</li>;
}
