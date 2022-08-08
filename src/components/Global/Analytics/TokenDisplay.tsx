import styles from '../Tabs/AccountTokensDisplay/AccountTokensDisplay.module.css';

interface TokenProps {
    token0: string | false;
    token1?: string | false;
}

export default function TokenDisplay(props: TokenProps) {
    const baseToken = (
        <img
            src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${props.token0}/logo.png`}
            onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '/question.svg';
            }}
        />
    );

    const quoteToken = (
        <img
            src={`https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${props.token1}/logo.png`}
            onError={({ currentTarget }) => {
                currentTarget.onerror = null;
                currentTarget.src = '/question.svg';
            }}
        />
    );

    return (
        <section className={styles.token_display_container}>
            {baseToken}
            {props.token1 ? quoteToken : <></>}
        </section>
    );
}
