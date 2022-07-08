// import styles from './SidebarAccordion.module.css';
import { MdPlayArrow } from 'react-icons/md';
import styles from './Sidebar.module.css';

interface Item {
    name: string;
    icon: string;
}

interface SidebarAccordionProps {
    children?: React.ReactNode;
    showSidebar: boolean;

    item: Item;
    idx: number;
}

export default function SidebarAccordion(props: SidebarAccordionProps) {
    const { children, showSidebar, idx, item } = props;

    console.log(item);
    return (
        <li key={idx} className={styles.sidebar_item}>
            <div className={styles.sidebar_link}>
                {showSidebar && <MdPlayArrow size={12} color='#ffffff' />}
                <img src={item.icon} alt={item.name} width='20px' />

                <span className={styles.link_text}>{item.name}</span>
            </div>
        </li>
    );
}
