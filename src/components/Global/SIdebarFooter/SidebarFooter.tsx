import styles from './SidebarFooter.module.css';

import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { MdAccountBox } from 'react-icons/md';
import { IoMdAnalytics } from 'react-icons/io';
import { RiSwapBoxFill } from 'react-icons/ri';
import { GiTrade } from 'react-icons/gi';

export default function SidebarFooter() {
    return (
        <div className={styles.sidebar_footer}>
            <Link to='/'>
                <FaHome size={18} color='#cdc1ff' />
                <p> Home</p>
            </Link>
            <Link to='/swap'>
                <RiSwapBoxFill size={18} color='#cdc1ff' />
                <p>Swap</p>
            </Link>
            <Link to='/trade/range'>
                <GiTrade size={18} color='#cdc1ff' />
                <p>Trade</p>
            </Link>
            <Link to='/analytics'>
                <IoMdAnalytics size={18} color='#cdc1ff' />
                <p>Analytics</p>
            </Link>
            <Link to='/account'>
                <MdAccountBox size={18} color='#cdc1ff' />
                <p>Account</p>
            </Link>
        </div>
    );
}
