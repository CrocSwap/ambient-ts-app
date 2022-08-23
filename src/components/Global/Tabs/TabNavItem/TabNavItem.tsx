import { Dispatch, SetStateAction } from 'react';
import styles from './TabNavItem.module.css';

interface TabNavItemPropsIF {
    title: string;
    setActiveTab: Dispatch<SetStateAction<string>>;
    id: string;
    activeTab: string;
}

export default function Toggle(props: TabNavItemPropsIF) {
    const { title, id, setActiveTab, activeTab } = props;

    const handleClick = () => setActiveTab(id);

    const activeStyle = activeTab === id ? styles.tab_active : null;

    return (
        <li onClick={handleClick} className={`${activeStyle} ${styles.tab_list}`}>
            {activeTab === id ? <div className={styles.underline} /> : null}
            {title}
        </li>
    );
}
