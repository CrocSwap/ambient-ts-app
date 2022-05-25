import styles from './RangeHeader.module.css';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

export default function RangeHeader() {
    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / DAI</div>
            <FiSettings />
        </ContentHeader>
    );

    return <>{tradeRouteHeader}</>;
}
