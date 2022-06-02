import styles from './LimitHeader.module.css';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../../Global/ContentHeader/ContentHeader';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface LimitHeaderPropsIF {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
}

export default function LimitHeader(props: LimitHeaderPropsIF) {
    const { tokenPair } = props;
    console.log(tokenPair);

    const tradeRouteHeader = (
        <ContentHeader>
            <span />
            <div className={styles.token_info}>
                {tokenPair.dataTokenA.symbol} / {tokenPair.dataTokenB.symbol}
            </div>
            <FiSettings />
        </ContentHeader>
    );

    return <>{tradeRouteHeader}</>;
}
