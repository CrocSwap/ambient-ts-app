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
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const { pool, chainId } = props;

    const dispatch = useAppDispatch();

    const tokenAAddress = pool.tokenA.address;
    const tokenBAddress = pool.tokenB.address;

    const [poolVolume, setPoolVolume] = useState<string | undefined>(undefined);
    const [poolTVL, setPoolTVL] = useState<string | undefined>(undefined);

    const poolIndex = lookupChain(chainId).poolIndex;

    useEffect(() => {
        (async () => {
            if (tokenAAddress && tokenBAddress) {
                const volumeResult = await getPoolVolume(tokenAAddress, tokenBAddress, poolIndex);

                if (volumeResult) {
                    // const volumeString =
                    //     volumeResult >= 1000000
                    //         ? volumeResult.toExponential(2)
                    //         : volumeResult.toLocaleString(undefined, {
                    //               maximumFractionDigits: 0,
                    //           });
                    const volumeString = formatAmount(volumeResult);

                    setPoolVolume(volumeString);
                }

                const tvlResult = await getPoolTVL(tokenAAddress, tokenBAddress, poolIndex);
                if (tvlResult) {
                    const tvString = formatAmount(tvlResult);

                    setPoolTVL(tvString);
                }
            }
        })();
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
            <div>{poolVolume}</div>
            <div>{poolTVL}</div>
        </div>
    );
}
