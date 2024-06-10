import styles from './Auctions.module.css';
import { HiMiniMagnifyingGlass } from 'react-icons/hi2';

export default function Auctions() {
    return (
        <div className={styles.auctions_main}>
            <h3>AUCTIONS</h3>
            <div className={styles.search_box}>
                <HiMiniMagnifyingGlass />
                <input type='text' />
                <button>X</button>
            </div>
            <div className={styles.sort_buttons}></div>
            <div className={styles.auctions_list}>
                <div className={styles.auction_headers}></div>
                <div className={styles.auctions_links}></div>
            </div>
        </div>
    );
}
