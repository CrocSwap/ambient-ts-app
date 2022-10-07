import styles from './InitPool.module.css';
import { useNavigate } from 'react-router-dom';
import { useUrlParams } from './useUrlParams';

interface propsIF {
    poolExists: boolean | null;
}

export default function InitPool(props: propsIF) {
    const { poolExists } = props;
    console.log({poolExists});

    const newPoolData = useUrlParams();
    const navigate = useNavigate();
    console.log(newPoolData);

    return (
        <main className={styles.main}>
            <h2>This is the Initialize Pool Page!</h2>
            <button onClick={() => navigate(-1)}>Go Back</button>
        </main>
    );
}
