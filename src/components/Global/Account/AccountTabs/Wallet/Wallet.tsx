import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import { TokenPriceFn } from '../../../../../App/functions/fetchTokenPrice';

// import { TokenIF } from '../../../../../utils/interfaces/exports';
interface WalletPropsIF {
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

export default function Wallet(props: WalletPropsIF) {
    const {
        cachedFetchTokenPrice,
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
        chainId,
        tokenMap,
    } = props;

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <WalletCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokenMap={tokenMap}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <WalletCard
                  key={idx}
                  token={item}
                  chainId={chainId}
                  tokenMap={tokenMap}
                  cachedFetchTokenPrice={cachedFetchTokenPrice}
              />
          ));
    return (
        <div className={styles.container}>
            <WalletHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
