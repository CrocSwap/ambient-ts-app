import styles from './SwapHeader.module.css';
import { MdShowChart } from 'react-icons/md';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';

interface swapHeaderProps {
    isOnTradeRoute?: boolean;
}

export default function SwapHeader(props: swapHeaderProps) {
    const { isOnTradeRoute } = props;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / USDC</div>
            <HiDotsHorizontal />
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <span>
                <MdShowChart />
            </span>
            <span className={styles.title}>Swap</span>
            <div className={styles.settings_container}>
                <HiDotsHorizontal />
                <FiSettings />
            </div>
        </ContentHeader>
    );

    return <>{isOnTradeRoute ? tradeRouteHeader : mainHeader}</>;
}
