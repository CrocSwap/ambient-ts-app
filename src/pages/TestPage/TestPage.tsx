import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { useUrlPath } from '../../utils/hooks/useUrlPath';

interface propsIF {
    chainId: string;
};

export default function TestPage(props: propsIF) {
    const { chainId } = props;
    const getURL = useUrlPath(chainId);

    const handleClick = () => {
        const paramsForLink = {
            chain: '0x5',
            tokenA: '0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C',
            tokenB: '0x0000000000000000000000000000000000000000',
        };
        const urlSlug: string = getURL.toSwap(paramsForLink);
        console.log({urlSlug});
    }

    return (
        <section className={styles.main}>
            <button onClick={handleClick}>
                Get Path
            </button>
        </section>
    );
}
