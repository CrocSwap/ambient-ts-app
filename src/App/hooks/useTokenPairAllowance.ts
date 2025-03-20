import { useContext, useEffect, useState } from 'react';
import {
    AppStateContext,
    ChainDataContext,
    CrocEnvContext,
    UserDataContext,
} from '../../contexts';
import { TradeDataContext } from '../../contexts/TradeDataContext';

export function useTokenPairAllowance() {
    const { isTradeRoute } = useContext(AppStateContext);
    const { tokenA, tokenB } = useContext(TradeDataContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const [tokenAAllowance, setTokenAAllowance] = useState<
        bigint | undefined
    >();
    const [tokenBAllowance, setTokenBAllowance] = useState<
        bigint | undefined
    >();

    const [recheckTokenAApproval, setRecheckTokenAApproval] =
        useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] =
        useState<boolean>(false);

    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (
                isTradeRoute &&
                crocEnv &&
                userAddress &&
                tokenA.address &&
                Number((await crocEnv.context).chain.chainId) === tokenA.chainId
            ) {
                try {
                    const allowance = await crocEnv
                        .token(tokenA.address)
                        .allowance(userAddress);

                    if (tokenAAllowance !== allowance) {
                        setTokenAAllowance(allowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenAApproval) setRecheckTokenAApproval(false);
            }
        })();
    }, [
        isTradeRoute,
        crocEnv,
        tokenA.address + tokenA.chainId + userAddress,
        lastBlockNumber,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (isTradeRoute && crocEnv && userAddress && tokenB.address) {
                try {
                    const allowance = await crocEnv
                        .token(tokenB.address)
                        .allowance(userAddress);

                    if (tokenBAllowance !== allowance) {
                        setTokenBAllowance(allowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenBApproval) setRecheckTokenBApproval(false);
            }
        })();
    }, [
        crocEnv,
        tokenB.address + tokenB.chainId + userAddress,
        lastBlockNumber,
        isTradeRoute,
        recheckTokenBApproval,
    ]);

    return {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    };
}
