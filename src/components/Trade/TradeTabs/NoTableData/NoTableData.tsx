import styles from './NoTableData.module.css';
import { AiFillFolderOpen } from 'react-icons/ai';
export default function NoTableData() {
    return (
        <div className={styles.container}>
            <AiFillFolderOpen size={90} color={'var(--text-grey-highlight)'} />
            <h2>NO DATA FOUND</h2>
            <p>Consider turning on all transactions</p>
            <button>All Transactions</button>
        </div>
    );
}
