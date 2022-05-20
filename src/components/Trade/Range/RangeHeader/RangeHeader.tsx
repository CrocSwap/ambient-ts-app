import styles from './RangeHeader.module.css';
import { HiDotsHorizontal } from 'react-icons/hi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';

export default function RangeHeader() {
    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / DAI</div>
            <HiDotsHorizontal />
        </ContentHeader>
    );

    return <>{tradeRouteHeader}</>;
}
