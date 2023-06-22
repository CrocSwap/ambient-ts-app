import styles from './Apy.module.css';

interface ApyProps {
    amount: number | undefined;
    fs?: string;
    lh?: string;
    center?: boolean;
    showTitle?: boolean;
}

export default function Apy(props: ApyProps) {
    const { amount, fs, lh, center, showTitle } = props;

    const amountString = amount
        ? amount >= 1000
            ? amount.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              }) + '%+'
            : amount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) + '%'
        : undefined;

    // const aprColor = styles.apr_green;
    const aprColor =
        amount !== undefined
            ? amount > 0
                ? styles.apr_green
                : styles.apr_red
            : styles.apr_green;
    return (
        <section
            className={`${styles.apr} ${aprColor} ${
                center && styles.align_center
            }`}
        >
            <p style={{ fontSize: fs ? fs : '', lineHeight: lh ? lh : '' }}>
                {amountString ? amountString : '…'}
            </p>
            {showTitle && (
                <p
                    className={aprColor}
                    style={{ fontSize: '24px', lineHeight: '30px' }}
                >
                    APR
                </p>
            )}
        </section>
    );
}
