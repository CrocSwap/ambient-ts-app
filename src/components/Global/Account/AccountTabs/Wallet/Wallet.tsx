import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';
import { CrocEnv } from '@crocswap-libs/sdk';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';

// import { TokenIF } from '../../../../../utils/interfaces/exports';
interface WalletPropsIF {
    crocEnv: CrocEnv | undefined;
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
        connectedAccountActive,
        connectedUserTokens,
        resolvedAddressTokens,
        chainId,
        tokenMap,
    } = props;

    const ItemContent = connectedAccountActive
        ? connectedUserTokens.map((item, idx) => (
              <WalletCard key={idx} token={item} chainId={chainId} tokenMap={tokenMap} />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <WalletCard key={idx} token={item} chainId={chainId} tokenMap={tokenMap} />
          ));
    return (
        <div className={styles.container}>
            <WalletHeader />
            <div className={styles.item_container}>{ItemContent}</div>
        </div>
    );
}
