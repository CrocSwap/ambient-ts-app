import { useParams } from 'react-router-dom';
import styles from './InitPool.module.css';

export default function InitPool() {
    const { params } = useParams();
    console.log(params);

    return (
        <main className={styles.main}>
            <h2>This is the Initialize Pool Page!</h2>
        </main>
    );
}