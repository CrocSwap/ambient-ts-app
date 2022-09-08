import styles from './Apy.module.css';

interface ApyProps {
    amount: number | undefined;
}

export default function Apy(props: ApyProps) {
    const { amount } = props;

    const amountString = amount
        ? amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          }) + '%'
        : undefined;

    const apyColor = styles.apy_green;
    // const apyColor =
    //     amount !== undefined ? (amount > 0 ? styles.apy_green : styles.apy_red) : styles.apy_green;
    return (
        <section className={`${styles.apy} ${apyColor}`}>
            <p>{amountString ? amountString : '…'}</p>
        </section>
    );
}
