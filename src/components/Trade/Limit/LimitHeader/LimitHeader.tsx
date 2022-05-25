import styles from './LimitHeader.module.css';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

export default function LimitHeader() {
    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / USDC</div>
            <FiSettings />
        </ContentHeader>
    );

    return <>{tradeRouteHeader}</>;
}
