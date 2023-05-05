import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { tokenMethodsIF } from '../../App/hooks/useNewTokens/useNewTokens';
import { tokenListURIs } from '../../utils/data/tokenListURIs';

interface propsIF {
    tokens: tokenMethodsIF,
    chainId: string,
}

export default function TestPage(props: propsIF) {
    const { tokens } = props;

    console.log(tokens.getBySource(tokenListURIs.coingecko));

    return (
        <section className={styles.main}>

        </section>
    );
}
