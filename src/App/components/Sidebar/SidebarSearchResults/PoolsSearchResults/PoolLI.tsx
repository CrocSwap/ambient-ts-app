import { formatAmountOld } from '../../../../../utils/numbers';
import styles from '../SidebarSearchResults.module.css';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import { useState, useEffect } from 'react';

interface propsIF {
    pool: TempPoolIF;
    chainId: string;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function PoolLI(props: propsIF) {
    const { pool, chainId, handleClick, cachedPoolStatsFetch } = props;

    // volume of pool to be displayed in the DOM
    const [poolVolume, setPoolVolume] = useState<string | undefined>();
    // TVL of pool to be displayed in the DOM
    const [poolTvl, setPoolTvl] = useState<string | undefined>();

    // logic to pull current values of volume and TVL for pool
    // this runs once and does not update after initial load
    useEffect(() => {
        (async () => {
            const poolStatsFresh = await cachedPoolStatsFetch(
                chainId,
                pool.base,
                pool.quote,
                pool.poolIdx,
                1,
            );
            const volume = poolStatsFresh?.volumeTotal; // display the total volume for all time
            const volumeString = volume
                ? '$' + formatAmountOld(volume)
                : undefined;
            setPoolVolume(volumeString);
            const tvl = poolStatsFresh?.tvl;
            const tvlString = tvl ? '$' + formatAmountOld(tvl) : undefined;
            setPoolTvl(tvlString);
        })();
    }, []);

    return (
        <li
            className={styles.card_container}
            onClick={() => handleClick(pool.base, pool.quote)}
        >
            <p>
                {pool.baseSymbol ?? '--'} / {pool.quoteSymbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>{poolVolume ?? '--'}</p>
            <p style={{ textAlign: 'center' }}>{poolTvl ?? '--'}</p>
        </li>
    );
}
