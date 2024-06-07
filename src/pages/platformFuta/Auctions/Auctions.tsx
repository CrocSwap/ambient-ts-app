import { Link } from 'react-router-dom';
import styles from './Auctions.module.css';
export default function Auctions() {
    return (
        <div className={styles.container}>
            <h1>AUCTIONS</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                Praesentium dicta, et labore culpa ratione, dolores ex itaque
                quo quos pariatur dolorum numquam exercitationem, debitis
                inventore aut rem eligendi saepe! Et ad officia quibusdam
                dolores id natus fugiat alias!
            </p>
            <Link to='/auctions/v1/foo'>FOO Token</Link>
        </div>
    );
}
