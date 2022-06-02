import styles from './SwapHeader.module.css';
import { MdShowChart } from 'react-icons/md';

import ContentHeader from '../../Global/ContentHeader/ContentHeader';
import settingsIcon from '../../../assets/images/icons/settings.svg';

interface swapHeaderProps {
    isOnTradeRoute?: boolean;
}

export default function SwapHeader(props: swapHeaderProps) {
    const { isOnTradeRoute } = props;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / USDC</div>

            <img src={settingsIcon} alt='settings' />
        </ContentHeader>
    );

    const mainHeader = (
        <ContentHeader>
            <span>
                <MdShowChart />
            </span>
            <span className={styles.title}>Swap</span>
            <div className={styles.settings_container}>
                <img src={settingsIcon} alt='settings' />
            </div>
        </ContentHeader>
    );

    return <>{isOnTradeRoute ? tradeRouteHeader : mainHeader}</>;
}
