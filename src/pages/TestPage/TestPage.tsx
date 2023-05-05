import styles from './TestPage.module.css';
import 'intro.js/introjs.css';
import { tokenMethodsIF } from '../../App/hooks/useNewTokens/useNewTokens';

interface propsIF {
    tokens: tokenMethodsIF,
    chainId: string,
}

export default function TestPage(props: propsIF) {
    const { tokens, chainId } = props;

    return (
        <section className={styles.main}>
            {
                JSON.stringify(
                    tokens.getByAddress(
                        '0xC04B0d3107736C32e19F1c62b2aF67BE61d63a05', chainId
                    )
                )
            }
        </section>
    );
}
