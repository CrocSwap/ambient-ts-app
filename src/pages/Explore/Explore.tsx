import { useContext, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';
import { AnalyticsContext } from '../../contexts/AnalyticsContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { PoolContext } from '../../contexts/PoolContext';

export default function Explore() {
    const cont = useContext(AnalyticsContext);
    const { poolList } = useContext(PoolContext);
    const { crocEnv, chainData } = useContext(CrocEnvContext);

    const getPools = async () => {
        if (crocEnv && poolList && cont.allPools.length === 0) {
            cont.getAllPoolData(poolList, crocEnv, chainData.chainId);
            console.log('sending a new fetch!');
        }
    };

    useEffect(() => console.log(cont.allPools), [cont.allPools]);

    useEffect(() => {
        getPools();
    }, [crocEnv, chainData.chainId]);

    return (
        <section
            style={{ background: 'var(--dark2)', height: 'calc(100vh - 56px)' }}
            className=' p-4 space-y-4 flex flex-col'
        >
            <p className='text-header1 leading-header1 text-text1 flex items-center justify-between flex-row px-1'>
                Top Pools on Ambient
                <button className='bg-dark3 rounded-md p-1'>
                    {' '}
                    <FiRefreshCw
                        size={18}
                        onClick={() => {
                            console.log('woah there');
                            getPools();
                        }}
                    />
                </button>
            </p>

            <TopPools allPools={cont.allPools} chainId={chainData.chainId} />
        </section>
    );
}
