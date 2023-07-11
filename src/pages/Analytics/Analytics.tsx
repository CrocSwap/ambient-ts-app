import { FiRefreshCw } from 'react-icons/fi';
import TopPools from '../../components/Global/Analytics/TopPools';

export default function Analytics() {
    return (
        <section
            style={{ background: 'var(--dark2)', height: 'calc(100vh - 56px)' }}
            className=' p-4 space-y-4 flex flex-col'
        >
            <p className='text-header1 leading-header1 text-text1 flex items-center justify-between flex-row px-1'>
                Top Pools on Ambient
                <button className='bg-dark3 rounded-md p-1'>
                    {' '}
                    <FiRefreshCw size={18} />
                </button>
            </p>

            <TopPools />
        </section>
    );
}
