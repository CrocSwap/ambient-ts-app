import styles from './RangeHeader.module.css';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { TokenPairIF } from '../../../../utils/interfaces/exports';

interface RangeHeaderPropsIF {
    tokenPair: TokenPairIF;
}

export default function RangeHeader(props: RangeHeaderPropsIF) {
    const { tokenPair } = props;
    console.log(tokenPair);

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>ETH / DAI</div>
            <FiSettings />
        </ContentHeader>
    );

    return <>{tradeRouteHeader}</>;
}
