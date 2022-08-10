import { useEffect, useState } from 'react';
import { fetchTokenBalances } from '../../../../../App/functions/fetchTokenBalances';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';

// import { TokenIF } from '../../../../../utils/interfaces/exports';
interface WalletPropsIF {
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
}
export default function Wallet(props: WalletPropsIF) {
    const { connectedAccountActive, resolvedAddress, chainId, tokenMap } = props;

    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resolvedAddressTokens, setResolvedAddressTokens] = useState<any[]>([]);

    useEffect(() => {
        (async () => {
            if (resolvedAddress && chainId) {
                try {
                    const newTokens = await fetchTokenBalances(
                        resolvedAddress,
                        chainId,
                        connectedAccountActive,
                        1, // arbitrary number
                    );
                    if (newTokens) setResolvedAddressTokens(newTokens);
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [resolvedAddress, chainId]);

    // const items = [1, 2, 3, 4, 5, 6];

    const ItemContent = connectedAccountActive
        ? tokensInRTK.map((item, idx) => (
              <WalletCard key={idx} token={item} chainId={chainId} tokenMap={tokenMap} />
          ))
        : resolvedAddressTokens.map((item, idx) => (
              <WalletCard key={idx} token={item} chainId={chainId} tokenMap={tokenMap} />
          ));
    return (
        <div className={styles.container}>
            <WalletHeader />
            {ItemContent}
        </div>
    );
}
