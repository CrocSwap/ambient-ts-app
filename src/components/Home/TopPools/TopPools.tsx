import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';

import { topPools } from '../../../App/mockData';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { ethers } from 'ethers';

interface TopPoolsProps {
    tokenMap: Map<string, TokenIF>;
    lastBlockNumber: number;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
}

export default function TopPools(props: TopPoolsProps) {
    const { tokenMap, lastBlockNumber, provider, chainId } = props;

    const { t } = useTranslation();

    const dispatch = useAppDispatch();

    return (
        <motion.div
            className={styles.container}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 2 } }}
        >
            <div className={styles.title}>{t('topPools')}</div>
            <div className={styles.content}>
                {topPools.map((pool, idx) => (
                    <NavLink key={idx} to='/trade/market'>
                        <PoolCard
                            name={pool.name}
                            tokenA={pool.base}
                            tokenB={pool.quote}
                            key={idx}
                            onClick={() => {
                                dispatch(setTokenA(pool.base));
                                dispatch(setTokenB(pool.quote));
                            }}
                            tokenMap={tokenMap}
                            lastBlockNumber={lastBlockNumber}
                            provider={provider}
                            chainId={chainId}
                        />
                    </NavLink>
                ))}
            </div>
        </motion.div>
    );
}
