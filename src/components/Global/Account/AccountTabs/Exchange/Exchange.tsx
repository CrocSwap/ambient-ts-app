import styles from './Exchange.module.css';
import ExchangeCard from './ExchangeCard';
import ExchangeHeader from './ExchangeHeader';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';
interface ExchangePropsIF {
    crocEnv: CrocEnv | undefined;
    cachedFetchTokenPrice: TokenPriceFn;
    connectedUserTokens: (TokenIF | undefined)[];
    resolvedAddressTokens: (TokenIF | undefined)[];
    lastBlockNumber: number;
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
}

export default function Exchange(props: ExchangePropsIF) {
    const {
        cachedFetchTokenPrice,
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
        //  resolvedAddress,
        chainId,
        tokenMap,
        //   lastBlockNumber,
        //    crocEnv
    } = props;

    // const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <ExchangeCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokenMap={tokenMap}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <ExchangeCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokenMap={tokenMap}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
          ));
    return (
        <div className={styles.container}>
            <ExchangeHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
