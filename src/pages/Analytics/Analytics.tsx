import { useContext, useEffect } from 'react';
import TopPools from '../../components/Global/Analytics/TopPools';
import { AnalyticsContext } from '../../contexts/AnalyticsContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';

export default function Analytics() {
    const cont = useContext(AnalyticsContext);
    const { poolList } = useContext(PoolContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);

    useEffect(() => {
        const getPools = async () => {
            if (crocEnv && poolList && cont.allPools.length === 0) {
                cont.getAllPoolData(poolList, crocEnv, chainData.chainId);
            }
        };
        getPools();
    }, [crocEnv, chainData.chainId]);

    return (
        <section
            style={{ background: 'var(--dark2)', height: 'calc(100vh - 56px)' }}
            className=' p-4 space-y-4 flex flex-col'
        >
            <p className='text-header1 leading-header1 text-text1'>
                Top Pools on Ambient
            </p>

            <TopPools allPools={cont.allPools} chainId={chainData.chainId} />
        </section>
    );
}
