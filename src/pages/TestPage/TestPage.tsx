import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { tokenMethodsIF } from '../../App/hooks/useNewTokens/useNewTokens';

interface propsIF {
    tokens: tokenMethodsIF,
    chainId: string,
}

export default function TestPage(props: propsIF) {
    const { tokens, chainId } = props;

    console.log(tokens.getByChain(chainId));

    return (
        <section className={styles.main}>

        </section>
    );
}
