import TopPools from '../../components/Global/Analytics/TopPools';
import 'intro.js/introjs.css';

export default function TestPage() {
    return (
        <section
            style={{ background: 'var(--dark2)', height: 'calc(100vh - 56px)' }}
            className=' p-4 space-y-4 flex flex-col'
        >
            <p className='text-header1 leading-header1 text-text1'>
                Top Pools on Ambient
            </p>

            <TopPools />
        </section>
    );
}
