import styles from './Apy.module.css';

interface ApyProps {
    amount: number | undefined;
    fs?: string;
    lh?: string;
    center?: boolean;
    showTitle?: boolean;
    fw?: string;
}

export default function Apy(props: ApyProps) {
    const { amount, fs, lh, center, showTitle, fw } = props;

    const amountString = amount
        ? amount >= 1000
            ? amount.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
              }) + '%+'
            : amount >= 10
              ? amount.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                }) + '%'
              : amount >= 1
                ? amount.toLocaleString('en-US', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                  }) + '%'
                : amount.toLocaleString('en-US', {
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
            <p
                style={{
                    fontWeight: fw ? fw : '100px',
                    fontSize: fs ? fs : '',
                    lineHeight: lh ? lh : '',
                }}
            >
                {amountString ? amountString : '…'}
            </p>
            {showTitle && (
                <p
                    className={aprColor}
                    style={{
                        fontSize: fs ? fs : '24px',
                        lineHeight: lh ? lh : '30px',
                        fontWeight: '100px',
                    }}
                >
                    APR
                </p>
            )}
        </section>
    );
}
