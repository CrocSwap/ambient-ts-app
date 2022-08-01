import { useEffect, useState } from 'react';
import { useTokenMap } from '../../../../../App/components/Sidebar/useTokenMap';
import { fetchTokenBalances } from '../../../../../App/functions/fetchTokenBalances';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';

// import { TokenIF } from '../../../../../utils/interfaces/exports';
interface WalletPropsIF {
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
}
export default function Wallet(props: WalletPropsIF) {
    const tokenMap = useTokenMap();

    const tokensInRTK = useAppSelector((state) => state.tokenData.tokens);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resolvedAddressTokens, setResolvedAddressTokens] = useState<any[]>([]);

    const { connectedAccountActive, resolvedAddress, chainId } = props;

    useEffect(() => {
        (async () => {
            if (resolvedAddress && chainId) {
                try {
                    const newTokens = await fetchTokenBalances(
                        resolvedAddress,
                        chainId,
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
