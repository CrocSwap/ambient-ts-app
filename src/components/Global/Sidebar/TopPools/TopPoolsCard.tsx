import styles from './TopPoolsCard.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { TokenIF } from '../../../../utils/interfaces/exports';
import { getPoolVolume, getPoolTVL } from '../../../../App/functions/getPoolStats';
import { useEffect, useState } from 'react';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { formatAmount } from '../../../../utils/numbers';
interface TopPoolsCardProps {
    pool: { name: string; tokenA: TokenIF; tokenB: TokenIF };
    chainId: string;
    lastBlockNumber: number;
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const { pool, chainId } = props;

    const dispatch = useAppDispatch();

    const tokenAAddress = pool.tokenA.address;
    const tokenBAddress = pool.tokenB.address;

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTVL, setPoolTVL] = useState<string | undefined>(undefined);

    const poolIndex = lookupChain(chainId).poolIndex;

    const getTopPoolsMetrics = async (
        tokenAAddress: string,
        tokenBAddress: string,
        poolIndex: number,
    ) => {
        if (tokenAAddress && tokenBAddress) {
            const volumeResult = await getPoolVolume(tokenAAddress, tokenBAddress, poolIndex);

            if (volumeResult) {
                const volumeString = formatAmount(volumeResult);
                setPoolVolume(volumeString);
            }

            const tvlResult = await getPoolTVL(tokenAAddress, tokenBAddress, poolIndex);
            if (tvlResult) {
                const tvlString = formatAmount(tvlResult);
                setPoolTVL(tvlString);
            }
        }
    };

    useEffect(() => {
        getTopPoolsMetrics(tokenAAddress, tokenBAddress, poolIndex);
        const timer = setTimeout(async () => {
            getTopPoolsMetrics(tokenAAddress, tokenBAddress, poolIndex);
        }, 60000); // run every 10 minutes
        return () => clearTimeout(timer);
    }, [tokenAAddress, tokenBAddress]);

    return (
        <div
            className={styles.container}
            onClick={() => {
                dispatch(setTokenA(props.pool.tokenA));
                dispatch(setTokenB(props.pool.tokenB));
            }}
        >
            <div>{pool.name}</div>
            <div>${poolVolume}</div>
            <div>${poolTVL}</div>
        </div>
    );
}
