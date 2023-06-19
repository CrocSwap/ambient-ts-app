export default function AprExplanation() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }}
        >
            <p>
                Estimated APR is based on historical volume, fee rate, and pool
                liquidity
            </p>
            <p>
                This value is only a historical estimate, and does not account
                for divergence loss from large price swings. Returns not
                guaranteed
            </p>
        </div>
    );
}
