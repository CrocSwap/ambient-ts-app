import { useContext } from 'react';
import { AppStateContext } from '../../contexts/AppStateContext';
import styles from './PointsBanner.module.css';
import { UserDataContext } from '../../contexts/UserDataContext';
import { Link, useNavigate } from 'react-router-dom';
import { MdClose } from 'react-icons/md';
import { SidebarContext } from '../../contexts/SidebarContext';
import useMediaQuery from '../../utils/hooks/useMediaQuery';

interface propsIF {
    dismissElem: () => void;
    smallCard?: boolean;
}

export default function PointsBanner(props: propsIF) {
    const { dismissElem, smallCard } = props;

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const isSmallScreen = useMediaQuery('(max-width: 1280px)') || isSidebarOpen;

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
        : smallCard
        ? 'Connect wallet to check your points'
        : 'Connect wallet to check your ambient points';

    return (
        <aside
            className={
                smallCard ? styles.points_banner_small : styles.points_banner
            }
        >
            <section
                className={styles.points_banner_container}
                style={{
                    flexDirection: smallCard ? 'column' : 'row',
                    padding: smallCard ? '32px 0' : ' 0px 64px 0px 32px',
                    textAlign: smallCard ? 'center' : 'justify',
                }}
            >
                <p
                    className={styles.left_side}
                    style={{ fontSize: isSmallScreen ? '30px' : '50px' }}
                >
                    ambient points
                </p>
                <div className={styles.right_side}>
                    <div className={styles.right_side_content}>
                        <p className={isSmallScreen && styles.small_text}>
                            {promptText}
                        </p>
                        <div className={styles.right_side_buttons}>
                            {isUserConnected ? (
                                <Link
                                    className={styles.connect_button}
                                    to='/account/xp'
                                >
                                    View Points
                                </Link>
                            ) : (
                                <button
                                    onClick={() => connectWallet()}
                                    className={styles.connect_button}
                                >
                                    Connect Wallet
                                </button>
                            )}
                            <button
                                onClick={() => goToLeaderboard()}
                                className={styles.leaderboard_link}
                            >
                                View Leaderboard
                            </button>
                        </div>
                    </div>
                    <button onClick={dismissElem} className={styles.close_icon}>
                        <MdClose size={30} />
                    </button>
                </div>
            </section>
        </aside>
    );
}
