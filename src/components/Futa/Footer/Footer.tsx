import { MdOutlineExplore } from 'react-icons/md';
import styles from './Footer.module.css';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FiPlusCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
export default function Footer() {
    const footerItems = [
        {
            label: 'Explore',
            link: '/explore',
            icon: <MdOutlineExplore size={24} color='var(--text1)' />,
        },
        {
            label: 'Account',
            link: '/account',
            icon: <RiAccountCircleLine size={24} color='var(--text1)' />,
        },
        {
            label: 'Create',
            link: '/create',
            icon: <FiPlusCircle size={24} color='var(--text1)' />,
        },
    ];

    return (
        <footer className={styles.container}>
            {footerItems.map((item, idx) => (
                <div key={idx} className={styles.footerContainer}>
                    <Link to={item.link} className={styles.footerItem}>
                        {item.icon}
                        {item.label}
                    </Link>
                </div>
            ))}
        </footer>
    );
}
