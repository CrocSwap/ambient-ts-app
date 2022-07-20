import styles from './DropdownMenuContainer.module.css';

interface DropdownMenuContainerProps {
    children: React.ReactNode;
}

export default function DropdownMenuContainer(props: DropdownMenuContainerProps) {
    return <div className={styles.dropdown}>{props.children}</div>;
}
