import { PoolIF } from '../../../../../ambient-utils/types';
import { PoolStatsFn } from '../../../../../ambient-utils/dataLayer';
import { TokenPriceFn } from '../../../../../ambient-utils/api';
import { CrocEnv } from '@crocswap-libs/sdk';
import { Results } from '../../../../../styled/Components/Sidebar';
import useFetchPoolStats from '../../../../hooks/useFetchPoolStats';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { useContext } from 'react';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    cachedPoolStatsFetch: PoolStatsFn;
    cachedFetchTokenPrice: TokenPriceFn;
    crocEnv?: CrocEnv;
}

export default function PoolSearchResult(props: propsIF) {
    const { pool, handleClick } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const poolData = useFetchPoolStats(pool);

    function handleClickFunction() {
        handleClick(pool.base.address, pool.quote.address);
        if (isPoolDropdownOpen) {
            setIsPoolDropdownOpen(false);
        }
    }

    return (
        <Results
            numCols={3}
            fullWidth
            fontWeight='300'
            fontSize='body'
            color='text2'
            padding='4px'
            onClick={handleClickFunction}
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
