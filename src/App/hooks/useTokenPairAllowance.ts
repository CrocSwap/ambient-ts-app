import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../utils/hooks/reduxToolkit';

interface PoolPricingPropsIF {
    crocEnv?: CrocEnv;
    account: `0x${string}` | undefined;
    lastBlockNumber: number;
}

export function useTokenPairAllowance(props: PoolPricingPropsIF) {
    const crocEnv = props.crocEnv;
    const tradeData = useAppSelector((state) => state.tradeData);

    const [tokenAAllowance, setTokenAAllowance] = useState<string>('');
    const [tokenBAllowance, setTokenBAllowance] = useState<string>('');

    const [recheckTokenAApproval, setRecheckTokenAApproval] =
        useState<boolean>(false);
    const [recheckTokenBApproval, setRecheckTokenBApproval] =
        useState<boolean>(false);

    // useEffect to check if user has approved CrocSwap to sell the token A
    useEffect(() => {
        (async () => {
            if (crocEnv && props.account && tradeData.tokenA.address) {
                try {
                    const allowance = await crocEnv
                        .token(tradeData.tokenA.address)
                        .allowance(props.account);
                    const newTokenAllowance = toDisplayQty(
                        allowance,
                        tradeData.tokenA.decimals,
                    );
                    if (tokenAAllowance !== newTokenAllowance) {
                        setTokenAAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenAApproval) setRecheckTokenAApproval(false);
            }
        })();
    }, [
        crocEnv,
        tradeData.tokenA.address,
        tradeData.tokenA.chainId,
        props.lastBlockNumber,
        props.account,
        recheckTokenAApproval,
    ]);

    // useEffect to check if user has approved CrocSwap to sell the token B
    useEffect(() => {
        (async () => {
            if (crocEnv && props.account && tradeData.tokenB.address) {
                try {
                    const allowance = await crocEnv
                        .token(tradeData.tokenB.address)
                        .allowance(props.account);
                    const newTokenAllowance = toDisplayQty(
                        allowance,
                        tradeData.tokenB.decimals,
                    );
                    if (tokenBAllowance !== newTokenAllowance) {
                        setTokenBAllowance(newTokenAllowance);
                    }
                } catch (err) {
                    console.warn(err);
                }
                if (recheckTokenBApproval) setRecheckTokenBApproval(false);
            }
        })();
    }, [
        crocEnv,
        tradeData.tokenB.address,
        tradeData.tokenB.chainId,
        props.lastBlockNumber,
        props.account,
        recheckTokenBApproval,
    ]);

    return {
        tokenAAllowance,
        tokenBAllowance,
        setRecheckTokenAApproval,
        setRecheckTokenBApproval,
    };
}
