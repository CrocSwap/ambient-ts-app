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
                An exchange balance is the quantity of a token previously
                deposited and currently available for the connected wallet to
                trade at lower gas costs.
            </p>

            <p></p>
            <p>
                To deposit collateral for later use, select Exchange Balance as
                the destination for the output of a trade, or deposit directly
                from your wallet on the Account page.
            </p>
            <p></p>
            <p>Collateral can be withdrawn any time.</p>
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
