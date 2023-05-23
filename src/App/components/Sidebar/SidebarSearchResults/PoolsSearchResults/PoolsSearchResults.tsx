import { useNavigate } from 'react-router-dom';
import styles from '../SidebarSearchResults.module.css';
import { TempPoolIF } from '../../../../../utils/interfaces/exports';
import { PoolStatsFn } from '../../../../functions/getPoolStats';
import PoolLI from './PoolLI';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

interface propsIF {
    searchedPools: TempPoolIF[];
    cachedPoolStatsFetch: PoolStatsFn;
}

export default function PoolsSearchResults(props: propsIF) {
    const { searchedPools, cachedPoolStatsFetch } = props;
    const { tokenA } = useAppSelector((state) => state.tradeData);

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const navigate = useNavigate();
    const handleClick = (baseAddr: string, quoteAddr: string): void => {
        const tokenAString: string =
            baseAddr.toLowerCase() === tokenA.address.toLowerCase()
                ? baseAddr
                : quoteAddr;
        const tokenBString: string =
            baseAddr.toLowerCase() === tokenA.address.toLowerCase()
                ? quoteAddr
                : baseAddr;
        navigate(
            '/trade/market/chain=' +
                chainId +
                '&tokenA=' +
                tokenAString +
                '&tokenB=' +
                tokenBString,
        );
    };

    return (
        <div>
            <h4 className={styles.card_title}>Pools</h4>
            {searchedPools.length ? (
                <>
                    <header className={styles.header}>
                        <div>Pool</div>
                        <div>Volume</div>
                        <div>TVL</div>
                    </header>
                    <ol className={styles.main_result_container}>
                        {searchedPools.slice(0, 4).map((pool: TempPoolIF) => (
                            <PoolLI
                                key={`sidebar_searched_pool_${JSON.stringify(
                                    pool,
                                )}`}
                                chainId={chainId}
                                handleClick={handleClick}
                                pool={pool}
                                cachedPoolStatsFetch={cachedPoolStatsFetch}
                            />
                        ))}
                    </ol>
                </>
            ) : (
                <h5 className={styles.not_found_text}>No Pools Found</h5>
            )}
        </div>
    );
}
