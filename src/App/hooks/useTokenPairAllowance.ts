import { CrocEnv } from '@crocswap-libs/sdk';
import { useContext, useEffect, useState } from 'react';
import { TradeDataContext } from '../../contexts/TradeDataContext';

interface PoolPricingPropsIF {
    crocEnv?: CrocEnv;
    userAddress: `0x${string}` | undefined;
    lastBlockNumber: number;
}

export function useTokenPairAllowance(props: PoolPricingPropsIF) {
    const crocEnv = props.crocEnv;
    const { tokenA, tokenB } = useContext(TradeDataContext);
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
            if (crocEnv && props.userAddress && tokenA.address) {
                try {
                    const allowance = await crocEnv
                        .token(tokenA.address)
                        .allowance(props.userAddress);

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
        crocEnv,
        tokenA.address + tokenA.chainId + props.userAddress,
        props.lastBlockNumber,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (crocEnv && props.userAddress && tokenB.address) {
                try {
                    const allowance = await crocEnv
                        .token(tokenB.address)
                        .allowance(props.userAddress);

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
        tokenB.address + tokenB.chainId + props.userAddress,
        props.lastBlockNumber,

        recheckTokenBApproval,
    ]);

    return {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    };
}
