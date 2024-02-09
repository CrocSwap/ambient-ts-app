import { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import styles from './PointsBanner.module.css';
import { UserDataContext } from '../../contexts/UserDataContext';
import { useNavigate } from 'react-router-dom';

interface propsIF {
    dismissElem: () => void;
}

export default function PointsBanner(props: propsIF) {
    const { dismissElem } = props;

    // hook to allow navigation on click to leaderboard
    // @Junior feel free to change the DOM to a `<Link />` element
    const navigate = useNavigate();

    // hook to allow the wagmi modal to be launched
    const { wagmiModal } = useContext(AppStateContext);

    // boolean to determine if user wallet is authenticated in the app
    const { isUserConnected } = useContext(UserDataContext);

    // click handler when user clicks the button to connect a wallet
    function connectWallet(): void {
        wagmiModal.open();
    }

    // click handler when user clicks the button to view the leaderboard
    // @Junior feel free to adjust the destination
    function goToLeaderboard(): void {
        navigate('/xp-leaderboard');
    }

    // text to display above the action buttons
    const promptText: string = isUserConnected
        ? 'Check your ambient points here'
        : 'Connect wallet to check your ambient points';

    return (
        <aside className={styles.points_banner}>
            <p className={styles.left_side}>ambient points</p>
            <div className={styles.right_side}>
                <div className={styles.right_side_content}>
                    <p>{promptText}</p>
                    <div className={styles.right_side_buttons}>
                        {isUserConnected || (
                            <button onClick={() => connectWallet()}>
                                Connect Wallet
                            </button>
                        )}
                        <button onClick={() => goToLeaderboard()}>
                            View Leaderboard
                        </button>
                    </div>
                </div>
                <button onClick={dismissElem}>X</button>
            </div>
        </aside>
    );
}
