// START: Import React and Dongles
import { MdShowChart } from 'react-icons/md';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';

// START: Import React Functional Components
import ContentHeader from '../../Global/ContentHeader/ContentHeader';

// START: Import Local Files
import styles from './SwapHeader.module.css';
import { TokenIF } from '../../../utils/interfaces/TokenIF';

// interface for props
interface swapHeaderProps {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
    isOnTradeRoute?: boolean;
}

// main react functional component
export default function SwapHeader(props: swapHeaderProps) {
    const { tokenPair, isOnTradeRoute } = props;

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {tokenPair.dataTokenA.symbol} / {tokenPair.dataTokenB.symbol}
            </div>
            <FiSettings />
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
