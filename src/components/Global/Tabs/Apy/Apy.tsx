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

    const aprColor = styles.apr_green;
    // const aprColor =
    //     amount !== undefined ? (amount > 0 ? styles.apr_green : styles.apr_red) : styles.apr_green;
    return (
        <section className={`${styles.apr} ${aprColor}`}>
            <p>{amountString ? amountString : '…'}</p>
        </section>
    );
}
