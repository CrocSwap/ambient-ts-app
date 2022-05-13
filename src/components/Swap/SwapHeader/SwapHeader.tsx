import styles from './SwapHeader.module.css';
import { MdShowChart } from 'react-icons/md';
import { HiDotsHorizontal } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import ContentHeader from '../../Global/ContentHeader/ContentHeader';

export default function SwapHeader() {
    return (
        <ContentHeader>
            <span>
                <MdShowChart />
            </span>
            <span className={styles.title}>Swap</span>
            <div className={styles.settings_container}>
                <HiDotsHorizontal />
                <FiSettings />
            </div>
        </ContentHeader>
    );
}
