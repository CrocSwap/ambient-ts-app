import PoolCard from '../../Global/PoolCard/PoolCard';
import styles from './TopPools.module.css';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAppDispatch } from '../../../utils/hooks/reduxToolkit';
import { setTokenA, setTokenB } from '../../../utils/state/tradeDataSlice';

import { topPools } from '../../../App/mockData';

export default function TopPools() {
    const { t } = useTranslation();

    const dispatch = useAppDispatch();

    return (
        // <AnimateSharedLayout>
        //     <motion.div
        //         className={styles.container}
        //         initial={{ width: 0 }}
        //         animate={{ width: '100%' }}
        //         exit={{ x: window.innerWidth, transition: { duration: 2 } }}
        //     >
        //         <div className={styles.title}>{t('topPools')}</div>
        //         <div className={styles.content}>
        //             {topPools.map((pool, idx) => (
        //                 <NavLink key={idx} to='/trade/market'>
        //                     <PoolCard
        //                         speed={pool.speed}
        //                         name={pool.name}
        //                         key={idx}
        //                         isSelected={selected === pool.id}
        //                         onMouseEnter={() => setSelected(pool.id ? pool.id : -2)}
        //                         onClick={() => {
        //                             dispatch(setTokenA(pool.tokenA));
        //                             dispatch(setTokenB(pool.tokenB));
        //                         }}
        //                     />
        //                 </NavLink>
        //             ))}
        //         </div>
        //     </motion.div>
        // </AnimateSharedLayout>
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
                            key={idx}
                            onClick={() => {
                                dispatch(setTokenA(pool.tokenA));
                                dispatch(setTokenB(pool.tokenB));
                            }}
                        />
                    </NavLink>
                ))}
            </div>
        </motion.div>
    );
}
