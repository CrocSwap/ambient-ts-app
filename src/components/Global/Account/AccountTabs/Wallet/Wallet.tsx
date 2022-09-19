import { CrocEnv } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import {
    memoizeFetchErc20TokenBalances,
    memoizeFetchNativeTokenBalance,
} from '../../../../../App/functions/fetchTokenBalances';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';
import styles from './Wallet.module.css';
import WalletCard from './WalletCard';
import WalletHeader from './WalletHeader';

// import { TokenIF } from '../../../../../utils/interfaces/exports';
interface WalletPropsIF {
    crocEnv: CrocEnv | undefined;
    lastBlockNumber: number;
    resolvedAddress: string;
    activeAccount: string;
    connectedAccountActive: boolean;
    chainId: string;
    tokenMap: Map<string, TokenIF>;
}

const cachedFetchErc20TokenBalances = memoizeFetchErc20TokenBalances();
const cachedFetchNativeTokenBalance = memoizeFetchNativeTokenBalance();

export default function Wallet(props: WalletPropsIF) {
    const { connectedAccountActive, resolvedAddress, chainId, tokenMap, lastBlockNumber, crocEnv } =
        props;

    const connectedUserNativeToken = useAppSelector((state) => state.userData.tokens.nativeToken);
    const connectedUserErc20Tokens = useAppSelector((state) => state.userData.tokens.erc20Tokens);

    const connectedUserTokens = [connectedUserNativeToken].concat(connectedUserErc20Tokens);

    const [resolvedAddressNativeToken, setResolvedAddressNativeToken] = useState<
        TokenIF | undefined
    >();
    const [resolvedAddressErc20Tokens, setResolvedAddressErc20Tokens] = useState<TokenIF[]>([]);

    const resolvedAddressTokens = [resolvedAddressNativeToken].concat(resolvedAddressErc20Tokens);

    useEffect(() => {
        (async () => {
            if (crocEnv && resolvedAddress && chainId) {
                try {
                    // console.log('fetching native token balance');
                    const newNativeToken = await cachedFetchNativeTokenBalance(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    if (
                        JSON.stringify(resolvedAddressNativeToken) !==
                        JSON.stringify(newNativeToken)
                    ) {
                        setResolvedAddressNativeToken(newNativeToken);
                    }
                } catch (error) {
                    console.log({ error });
                }
                try {
                    const updatedTokens: TokenIF[] = resolvedAddressErc20Tokens;

                    // console.log('fetching resolved user erc20 token balances');
                    const erc20Results = await cachedFetchErc20TokenBalances(
                        resolvedAddress,
                        chainId,
                        lastBlockNumber,
                        crocEnv,
                    );

                    erc20Results.map((newToken: TokenIF) => {
                        const indexOfExistingToken = resolvedAddressErc20Tokens.findIndex(
                            (existingToken) => existingToken.address === newToken.address,
                        );

                        if (indexOfExistingToken === -1) {
                            updatedTokens.push(newToken);
                        } else if (
                            JSON.stringify(resolvedAddressErc20Tokens[indexOfExistingToken]) !==
                            JSON.stringify(newToken)
                        ) {
                            updatedTokens[indexOfExistingToken] = newToken;
                        }
                    });
                    setResolvedAddressErc20Tokens(updatedTokens);
                } catch (error) {
                    console.log({ error });
                }
            }
        })();
    }, [crocEnv, resolvedAddress, chainId, lastBlockNumber]);

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
