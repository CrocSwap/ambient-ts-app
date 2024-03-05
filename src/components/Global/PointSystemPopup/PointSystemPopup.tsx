import { FlexContainer } from '../../../styled/Common';
0;
import styles from './PointSystemPopup.module.css';
import { VscClose } from 'react-icons/vsc';
import { Link, useLocation } from 'react-router-dom';
import { useCallback, useContext, useEffect, useRef } from 'react';
import useOnClickOutside from '../../../utils/hooks/useOnClickOutside';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import ambientXblastLogo from '../../../assets/images/logos/ambientXBlast.svg';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

interface PropsIF {
    dismissPointSystemPopup(ctaDismissal: { ctaId: string }): void;
}

export default function PointSystemPopup(props: PropsIF) {
    const { dismissPointSystemPopup } = props;
    const isSmallScreen = useMediaQuery('(max-width: 1400px)');

    const location = useLocation();
    const currentLocation = location.pathname.includes('/xp')
        ? '/xp'
        : location.pathname;
    const {
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const { isActiveNetworkBlast } = useContext(ChainDataContext);
    const { isUserConnected } = useContext(UserDataContext);
    const isEnabledLocally =
        process.env.REACT_APP_POINT_SYSTEM_POPUP_ENABLED !== undefined
            ? process.env.REACT_APP_POINT_SYSTEM_POPUP_ENABLED === 'true'
            : true;

    const escFunction = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            dismissPointSystemPopup({ ctaId: 'points_modal_cta' });
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', escFunction, false);
        return () => {
            document.removeEventListener('keydown', escFunction, false);
        };
    }, []);
    const popupModal = useRef<HTMLDivElement>(null);

    useOnClickOutside(popupModal, () =>
        dismissPointSystemPopup({ ctaId: 'points_modal_cta' }),
    );

    const handleConnectButtonClick = () => {
        openWagmiModal();
        dismissPointSystemPopup({ ctaId: 'points_modal_cta' });
    };
    // Any location we won't to exclude the popup from goes here
    const excludedLocations = ['/404', '/terms', '/privacy', '/trade', '/xp'];

    if (
        excludedLocations.includes(currentLocation) ||
        !isEnabledLocally ||
        isSmallScreen
    )
        return null;
    return (
        <div className={styles.outside_modal} role='dialog' aria-modal='true'>
            <div className={styles.modal} ref={popupModal}>
                <header className={styles.modal_header}>
                    <VscClose
                        size={24}
                        color='var(--text2)'
                        onClick={() =>
                            dismissPointSystemPopup({
                                ctaId: 'points_modal_cta',
                            })
                        }
                    />
                </header>
                <section className={styles.modal_content}>
                    <FlexContainer flexDirection='column' gap={87}>
                        <FlexContainer
                            flexDirection='row'
                            gap={10}
                            alignItems='center'
                        >
                            {isActiveNetworkBlast ? (
                                <img
                                    src={ambientXblastLogo}
                                    alt=''
                                    width='800px'
                                />
                            ) : (
                                <p
                                    className={styles.ambient_blast_logo}
                                    style={{ fontSize: '90px' }}
                                >
                                    ambient points
                                </p>
                            )}
                        </FlexContainer>
                        <p className={styles.sub_text}>
                            {isActiveNetworkBlast
                                ? ' points now live!'
                                : ' now live!'}
                        </p>

                        <FlexContainer
                            flexDirection='column'
                            gap={32}
                            alignItems='center'
                        >
                            <h2 className={styles.sub_text}>
                                {isUserConnected
                                    ? 'Check your ambient points here'
                                    : 'Connect wallet to check your ambient points'}
                            </h2>
                            <FlexContainer
                                flexDirection='row'
                                alignItems='center'
                                gap={32}
                            >
                                {isUserConnected ? (
                                    <Link
                                        className={styles.connect_button}
                                        to='/account/xp'
                                        onClick={() =>
                                            dismissPointSystemPopup({
                                                ctaId: 'points_modal_cta',
                                            })
                                        }
                                    >
                                        View Points
                                    </Link>
                                ) : (
                                    <button
                                        className={styles.connect_button}
                                        onClick={handleConnectButtonClick}
                                    >
                                        Connect wallet
                                    </button>
                                )}

                                <Link
                                    className={styles.leaderboard_link}
                                    to='/xp-leaderboard'
                                    onClick={() =>
                                        dismissPointSystemPopup({
                                            ctaId: 'points_modal_cta',
                                        })
                                    }
                                >
                                    View Leaderboard
                                </Link>
                            </FlexContainer>
                        </FlexContainer>
                    </FlexContainer>
                </section>
            </div>
        </div>
    );
}
