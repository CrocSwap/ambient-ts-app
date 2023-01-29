import { Link } from 'react-router-dom';

export default function ExchangeBalanceExplanation() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }}
        >
            <p>
                Collateral deposited into the Ambient Finance exchange can be traded at lower gas
                costs.
            </p>
            <p>
                To deposit collateral, select Exchange Balance as the destination for the output of
                a trade, or you can deposit directly from your wallet on the Account page.
            </p>
            <p>Collateral can be withdrawn at any time.</p>
            <Link
                to='/account'
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    color: 'var(--text-highlight)',
                    cursor: 'pointer',
                }}
            >
                View more
            </Link>
        </div>
    );
}
