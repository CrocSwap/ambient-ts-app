import { useContext, useEffect, useState } from 'react';
import { ATLAS_ROUTER } from '../../ambient-utils/constants';
import {
    AppStateContext,
    ChainDataContext,
    CrocEnvContext,
    UserDataContext,
} from '../../contexts';
import { TradeDataContext } from '../../contexts/TradeDataContext';
import { useFastLaneProtection } from './useFastLaneProtection';

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

    const fastLaneProtection = useFastLaneProtection();

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
                    const context = await crocEnv.context;
                    const acceptedChainId = fastLaneProtection?.isChainAccepted(
                        (await crocEnv.context).chain.chainId,
                    );
                    // Default to false if fastLaneProtection is undefined during initialization
                    const isFastLaneEnabled =
                        (fastLaneProtection?.isEnabled && acceptedChainId) ??
                        false;
                    const spender = isFastLaneEnabled
                        ? ATLAS_ROUTER
                        : await context.dex.getAddress();

                    const allowance = await crocEnv
                        .token(tokenA.address)
                        .allowance(userAddress, spender);

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
        fastLaneProtection?.isEnabled,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (isTradeRoute && crocEnv && userAddress && tokenB.address) {
                try {
                    const context = await crocEnv.context;
                    const acceptedChainId = fastLaneProtection?.isChainAccepted(
                        (await crocEnv.context).chain.chainId,
                    );
                    // Default to false if fastLaneProtection is undefined during initialization
                    const isFastLaneEnabled =
                        (fastLaneProtection?.isEnabled && acceptedChainId) ??
                        false;
                    const spender = isFastLaneEnabled
                        ? ATLAS_ROUTER
                        : await context.dex.getAddress();

                    const allowance = await crocEnv
                        .token(tokenB.address)
                        .allowance(userAddress, spender);

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
        fastLaneProtection?.isEnabled,
    ]);

    return {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
        fastLaneProtection,
    };
}
