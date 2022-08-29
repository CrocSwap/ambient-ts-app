import styles from './Apy.module.css';

interface ApyProps {
    amount: number;
}

export default function Apy(props: ApyProps) {
    const { amount } = props;

    const amountString =
        amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + '%';

    const apyColor = amount > 20 ? styles.apy_green : styles.apy_red;
    return (
        <section className={`${styles.apy} ${apyColor}`}>
            <p>{amountString}</p>
        </section>
    );
}
