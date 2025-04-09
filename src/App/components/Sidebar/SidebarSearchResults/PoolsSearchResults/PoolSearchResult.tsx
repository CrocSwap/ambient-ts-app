import { useContext } from 'react';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { PoolIF } from '../../../../../ambient-utils/types';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { Results } from '../../../../../styled/Components/Sidebar';

interface propsIF {
    pool: PoolIF;
    handleClick: (baseAddr: string, quoteAddr: string) => void;
}

export default function PoolSearchResult(props: propsIF) {
    const { pool, handleClick } = props;
    const { isPoolDropdownOpen, setIsPoolDropdownOpen } =
        useContext(SidebarContext);

    function handleClickFunction() {
        handleClick(pool.base, pool.quote);
        if (isPoolDropdownOpen) {
            setIsPoolDropdownOpen(false);
        }
    }

    const volumeDisplayString: string = pool.volumeChange24h
        ? getFormattedNumber({
              value: pool.volumeChange24h,
              prefix: '$',
          })
        : '';

    const tvlDisplayString: string = pool.tvlTotalUsd
        ? getFormattedNumber({
              value: pool.tvlTotalUsd,
              isTvl: true,
              prefix: '$',
          })
        : '';

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
                {pool.baseToken.symbol ?? '--'} /{' '}
                {pool.quoteToken.symbol ?? '--'}
            </p>
            <p style={{ textAlign: 'center' }}>
                {`${volumeDisplayString ? volumeDisplayString : '...'}`}
            </p>
            <p style={{ textAlign: 'center' }}>
                {`${tvlDisplayString ? tvlDisplayString : '...'}`}
            </p>
        </Results>
    );
}
