import { useContext, useEffect, useState } from 'react';
import { IS_LOCAL_ENV } from '../../ambient-utils/constants';
import { TokenIF } from '../../ambient-utils/types';
import { AppStateContext } from '../../contexts/AppStateContext';
import { ChainDataContext } from '../../contexts/ChainDataContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { TradeTokenContext } from '../../contexts/TradeTokenContext';
import { UserDataContext } from '../../contexts/UserDataContext';

interface BalancesIF {
    baseTokenBalance: string;
    setBaseTokenBalance: React.Dispatch<React.SetStateAction<string>>;
    quoteTokenBalance: string;
    setQuoteTokenBalance: React.Dispatch<React.SetStateAction<string>>;
    baseTokenDexBalance: string;
    setBaseTokenDexBalance: React.Dispatch<React.SetStateAction<string>>;
    quoteTokenDexBalance: string;
    setQuoteTokenDexBalance: React.Dispatch<React.SetStateAction<string>>;
    tokenAAllowance: bigint | undefined;
    tokenBAllowance: bigint | undefined;
    setRecheckTokenAApproval: (val: boolean) => void;
    setRecheckTokenBApproval: (val: boolean) => void;
    isTokenABase: boolean;
}

// deprecated
export const useTokenBalancesAndAllowances = (
    baseToken: TokenIF,
    quoteToken: TokenIF,
): BalancesIF => {
    const { isUserIdle } = useContext(AppStateContext);
    const {
        isTokenABase,
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    } = useContext(TradeTokenContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);

    const { userAddress, isUserConnected } = useContext(UserDataContext);

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
    };
};
