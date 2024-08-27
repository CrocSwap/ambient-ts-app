import { PoolIF, TokenIF } from '../../../../../ambient-utils/types';
import { Results } from '../../../../../styled/Components/Sidebar';
import useFetchPoolStats from '../../../../hooks/useFetchPoolStats';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { useContext } from 'react';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
    spotPrice: number | undefined;
    defaultTokens: TokenIF[];
}

export default function PoolSearchResult(props: propsIF) {
    const { pool, handleClick, spotPrice, defaultTokens } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    const poolData = useFetchPoolStats(pool, spotPrice, defaultTokens);

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
