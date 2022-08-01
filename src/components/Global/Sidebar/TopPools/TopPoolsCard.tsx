import styles from './TopPoolsCard.module.css';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../../utils/state/tradeDataSlice';
import { TokenIF } from '../../../../utils/interfaces/exports';
import { getPoolVolume, getPoolTVL } from '../../../../App/functions/getPoolStats';
import { useEffect, useState } from 'react';

interface TopPoolsCardProps {
    pool: { name: string; tokenA: TokenIF; tokenB: TokenIF };
}

export default function TopPoolsCard(props: TopPoolsCardProps) {
    const dispatch = useAppDispatch();

    const tokenAAddress = props.pool.tokenA.address;
    const tokenBAddress = props.pool.tokenB.address;

    const [poolVolume, setPoolVolume] = useState(0);
    const [poolTVL, setPoolTVL] = useState(0);

    useEffect(() => {
        (async () => {
            if (tokenAAddress && tokenBAddress) {
                const volumeResult = await getPoolVolume(tokenAAddress, tokenBAddress, 36000);
                if (volumeResult) setPoolVolume(volumeResult);

                const tvlResult = await getPoolTVL(tokenAAddress, tokenBAddress, 36000);
                if (tvlResult) setPoolTVL(tvlResult);
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
            <div>{props.pool.name}</div>
            <div>{poolVolume}</div>
            <div>{poolTVL}</div>
        </div>
    );
}
