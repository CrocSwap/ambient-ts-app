import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
import { tokenMethodsIF } from '../../../../../App/hooks/useNewTokens/useNewTokens';

interface propsIF {
    cachedFetchTokenPrice: TokenPriceFn;
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    lastBlockNumber: number;
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokens: tokenMethodsIF;
}

export default function Exchange(props: propsIF) {
    const {
        cachedFetchTokenPrice,
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
        chainId,
        tokens,
    } = props;

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <ExchangeCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokens={tokens}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <ExchangeCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokens={tokens}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
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
