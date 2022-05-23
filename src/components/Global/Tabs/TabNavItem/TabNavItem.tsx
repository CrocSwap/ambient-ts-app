import styles from './TabNavItem.module.css';
import { SetStateAction } from 'react';

interface TabNavItemProps {
    title: string;

    setActiveTab: React.Dispatch<SetStateAction<string>>;
    id: string;
    activeTab: string;
}
export default function Toggle(props: TabNavItemProps) {
    const { title, id, setActiveTab, activeTab } = props;

    const handleClick = () => {
        setActiveTab(id);
    };

    const activeStyle = activeTab === id ? styles.active : null;
    return (
        <li onClick={handleClick} className={activeStyle}>
            {title}
        </li>
    );
}
