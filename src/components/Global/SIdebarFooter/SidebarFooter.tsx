import styles from './SidebarFooter.module.css';

import topPoolsImage from '../../../assets/images/sidebarImages/topPools.svg';
import topTokensImage from '../../../assets/images/sidebarImages/topTokens.svg';
// import favouritePoolsImage from '../../../assets/images/sidebarImages/favouritePools.svg';
import openOrdersImage from '../../../assets/images/sidebarImages/openOrders.svg';
import rangePositionsImage from '../../../assets/images/sidebarImages/rangePositions.svg';
import recentTransactionsImage from '../../../assets/images/sidebarImages/recentTransactions.svg';
import { Link } from 'react-router-dom';

export default function SidebarFooter() {
    return (
        <div className={styles.sidebar_footer}>
            <Link to='/analytics'>
                <img src={topTokensImage} alt='top tokens' />
                <p> Tokens</p>
            </Link>
            <Link to='/analytics'>
                <img src={topPoolsImage} alt='top pools' />
                <p> Pools</p>
            </Link>
            <Link to='/analytics'>
                <img src={rangePositionsImage} alt='range positions' />
                <p>Ranges</p>
            </Link>
            <Link to='/analytics'>
                <img src={openOrdersImage} alt='Open Orders' />
                <p>Orders</p>
            </Link>
            <Link to='/analytics'>
                <img src={recentTransactionsImage} alt='recent transactions' />
                <p>Transactions</p>
            </Link>
        </div>
    );
}
