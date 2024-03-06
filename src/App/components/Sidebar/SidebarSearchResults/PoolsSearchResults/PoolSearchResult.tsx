import { PoolIF } from '../../../../../ambient-utils/types';
import { PoolStatsFn } from '../../../../../ambient-utils/dataLayer';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import { CrocEnv } from '@crocswap-libs/sdk';
import { Results } from '../../../../../styled/Components/Sidebar';
import useFetchPoolStats from '../../../../hooks/useFetchPoolStats';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv?: CrocEnv;
}

export default function PoolSearchResult(props: propsIF) {
    const { pool, handleClick } = props;

    const poolData = useFetchPoolStats(pool);

    return (
        <Results
            numCols={3}
            fullWidth
            fontWeight='300'
            fontSize='body'
            color='text2'
            padding='4px'
            onClick={() => handleClick(pool.base.address, pool.quote.address)}
        >
            <p>
                {pool.base.symbol ?? '--'} / {pool.quote.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>
                {`${
                    poolData.poolVolume24h
                        ? '$' + poolData.poolVolume24h
                        : '...'
                }`}
            </p>
            <p style={{ textAlign: 'center' }}>
                {`${poolData.poolTvl ? '$' + poolData.poolTvl : '...'}`}
            </p>
        </Results>
    );
}
