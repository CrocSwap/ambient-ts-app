import { useContext, useEffect, useState } from 'react';
import { TokenIF } from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts/AppStateContext';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { ChartContext } from '../../contexts/ChartContext';
import { RangeContext } from '../../contexts/RangeContext';
import { TokenContext } from '../../contexts/TokenContext';
import { useTokenPairAllowance } from './useTokenPairAllowance';
import { usePoolMetadata } from './usePoolMetadata';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { UserDataContext } from '../../contexts/UserDataContext';
import { ReceiptContext } from '../../contexts/ReceiptContext';

interface BalancesIF {
    baseTokenBalance: string;
    setBaseTokenBalance: React.Dispatch<React.SetStateAction<string>>;
    quoteTokenBalance: string;
    setQuoteTokenBalance: React.Dispatch<React.SetStateAction<string>>;
    baseTokenDexBalance: string;
    baseTokenAddress: string;
    setBaseTokenDexBalance: React.Dispatch<React.SetStateAction<string>>;
    quoteTokenDexBalance: string;
    setQuoteTokenDexBalance: React.Dispatch<React.SetStateAction<string>>;
    tokenAAllowance: string;
    tokenBAllowance: string;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
}
export const useTokenBalancesAndAllowances = (
    baseToken: TokenIF,
    quoteToken: TokenIF,
): BalancesIF => {
    const {
        server: { isEnabled: isServerEnabled },
        isUserIdle,
    } = useContext(AppStateContext);
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const { crocEnv, chainData, activeNetwork } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { isEnabled: isChartEnabled } = useContext(ChartContext);
    const { setSimpleRangeWidth } = useContext(RangeContext);
    const { tokens } = useContext(TokenContext);

    const { userAddress, isUserConnected } = useContext(UserDataContext);
    const { sessionReceipts } = useContext(ReceiptContext);

    const {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useTokenPairAllowance({
        crocEnv,
        userAddress,
        lastBlockNumber,
    });

    const { isTokenABase, baseTokenAddress } = usePoolMetadata({
        crocEnv,
        graphCacheUrl: activeNetwork.graphCacheUrl,
        pathname: location.pathname,
        chainData,
        userAddress,
        searchableTokens: tokens.tokenUniv,
        receiptCount: sessionReceipts.length,
        lastBlockNumber,
        isServerEnabled,
        cachedFetchTokenPrice,
        cachedQuerySpotPrice,
        cachedTokenDetails,
        cachedEnsResolve,
        setSimpleRangeWidth,
        isChartEnabled,
    });

    // Calculate token balances within the hook
    const [baseTokenBalance, setBaseTokenBalance] = useState<string>('');
    const [quoteTokenBalance, setQuoteTokenBalance] = useState<string>('');
    const [baseTokenDexBalance, setBaseTokenDexBalance] = useState<string>('');
    const [quoteTokenDexBalance, setQuoteTokenDexBalance] =
        useState<string>('');

    // useEffect to update selected token balances
    useEffect(() => {
        if (
            !isUserIdle &&
            crocEnv &&
            userAddress &&
            isUserConnected &&
            baseToken.address &&
            quoteToken.address
        ) {
            crocEnv
                .token(baseToken.address)
                .walletDisplay(userAddress)
                .then((bal: string) => {
                    if (bal !== baseTokenBalance) {
                        setBaseTokenBalance(bal);
                    }
                })
                .catch(console.error);
            crocEnv
                .token(baseToken.address)
                .balanceDisplay(userAddress)
                .then((bal: string) => {
                    if (bal !== baseTokenDexBalance) {
                        IS_LOCAL_ENV &&
                            console.debug('setting base token dex balance');
                        setBaseTokenDexBalance(bal);
                    }
                })
                .catch(console.error);
            crocEnv
                .token(quoteToken.address)
                .walletDisplay(userAddress)
                .then((bal: string) => {
                    if (bal !== quoteTokenBalance) {
                        IS_LOCAL_ENV &&
                            console.debug('setting quote token balance');
                        setQuoteTokenBalance(bal);
                    }
                })
                .catch(console.error);
            crocEnv
                .token(quoteToken.address)
                .balanceDisplay(userAddress)
                .then((bal: string) => {
                    if (bal !== quoteTokenDexBalance) {
                        setQuoteTokenDexBalance(bal);
                    }
                })
                .catch(console.error);
        }
    }, [
        crocEnv,
        isUserConnected,
        userAddress,
        baseToken.address + quoteToken.address,
        lastBlockNumber,
        isUserIdle,
    ]);

    return {
        baseTokenBalance,
        setBaseTokenBalance,
        quoteTokenBalance,
        setQuoteTokenBalance,
        baseTokenDexBalance,
        setBaseTokenDexBalance,
        quoteTokenDexBalance,
        setQuoteTokenDexBalance,
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        isTokenABase,
        baseTokenAddress,
    };
};
