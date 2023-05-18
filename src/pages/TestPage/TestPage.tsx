import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { useUrlPath } from '../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string;
};

export default function TestPage(props: propsIF) {
    const { chainId } = props;
    const urlMethods = useUrlPath(chainId);

    return (
        <section className={styles.main}>
            <button onClick={() => console.log(urlMethods.location)}>
                Get Path
            </button>
        </section>
    );
}
