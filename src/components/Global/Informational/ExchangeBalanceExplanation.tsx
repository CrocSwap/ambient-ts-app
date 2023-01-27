import { Link } from 'react-router-dom';

export default function ExchangeBalanceExplanation() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <p>this is an explanation of the exchange balance</p>
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
