import { Link } from 'react-router-dom';

export default function WalletBalanceExplanation() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
            }}
        >
            <p>
                A wallet balance is the quantity of a token that you have
                available to trade or deposit directly from the connected
                wallet.
            </p>
            <p></p>
            <p>
                In order to trade/deposit an ERC-20 token from your wallet (e.g.
                USDC), we will first prompt you to generate an approval
                transaction.
            </p>
            <p></p>
            <p>
                To deposit collateral for later use at lower gas costs, select
                Exchange Balance as the destination for the output of a trade,
                or deposit directly from your wallet on the Account page.
            </p>
            <p></p>

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
