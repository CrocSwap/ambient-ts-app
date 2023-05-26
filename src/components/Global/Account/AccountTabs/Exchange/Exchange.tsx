import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { tokenMethodsIF } from '../../../../../App/hooks/useTokens';

interface propsIF {
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    resolvedAddress: string;
    connectedAccountActive: boolean;
    tokens: tokenMethodsIF;
}

export default function Exchange(props: propsIF) {
    const {
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
        tokens,
    } = props;

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <ExchangeCard key={idx} token={item} tokens={tokens} />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <ExchangeCard key={idx} token={item} tokens={tokens} />
          ));

    return (
        <div
            className={styles.container}
            style={{ height: 'calc(100vh - 19.5rem' }}
        >
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
