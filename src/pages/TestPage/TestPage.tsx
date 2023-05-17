import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { useUrlPath } from '../../utils/hooks/useUrlPath';

export default function TestPage() {
    const urlMethods = useUrlPath();

    return (
        <section className={styles.main}>
            <button onClick={() => console.log(urlMethods.getPath('index'))}>
                Get Path
            </button>
        </section>
    );
}
