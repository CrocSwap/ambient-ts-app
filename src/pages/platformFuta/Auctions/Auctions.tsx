import { Link } from 'react-router-dom';
import styles from './Auctions.module.css';
export default function Auctions() {
    return (
        <div className={styles.container}>
            <p>auctions:</p>
            <Link to='/auctions/foo'>FOO Token</Link>
        </div>
    );
}
