import { useContext } from 'react';
import { PoolIF } from '../../../../../ambient-utils/types';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { Results } from '../../../../../styled/Components/Sidebar';
import useFetchPoolStats from '../../../../hooks/useFetchPoolStats';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    spotPrice: number | undefined;
}

export default function PoolSearchResult(props: propsIF) {
    const { pool, handleClick, spotPrice } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const poolData = useFetchPoolStats(pool, spotPrice);

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
