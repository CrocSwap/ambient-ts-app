// START: Import React and Dongles
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import { trimString } from '../../../ambient-utils/dataLayer';

import NoisyLines from '../../NoisyLines/NoisyLines';
import styles from './PortfolioBanner.module.css'
import {
    UserDataContext,
    UserXpDataIF,
} from '../../../contexts/UserDataContext';
import { Dispatch, SetStateAction, useContext, useMemo } from 'react';
import UserLevelDisplay from '../../Global/LevelsCard/UserLevelDisplay';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { PoolContext } from '../../../contexts/PoolContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface propsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
    resolvedUserXp: UserXpDataIF;
    showTabsAndNotExchange: boolean;
    setShowTabsAndNotExchange: Dispatch<SetStateAction<boolean>>
}

export default function PortfolioBanner(props: propsIF) {
    const { ensName, resolvedAddress, connectedAccountActive, resolvedUserXp, showTabsAndNotExchange, setShowTabsAndNotExchange } =
        props;
    const { userAddress } = useContext(UserDataContext);
    const { connectedUserXp } = useContext(ChainDataContext);

    const desktopScreen = useMediaQuery('(min-width: 768px)');


    const { isTradeDollarizationEnabled, setIsTradeDollarizationEnabled } =
        useContext(PoolContext);

    const xpData =
        connectedAccountActive || location.pathname === '/account/xp'
            ? connectedUserXp
            : resolvedUserXp;

    const ensNameAvailable = ensName !== '';

    const addressOfAccountDisplayed = resolvedAddress
        ? resolvedAddress.toLowerCase()
        : userAddress?.toLowerCase() ?? '';

    const myJazzicon = (
        <Jazzicon
            diameter={50}
            seed={jsNumberForAddress(addressOfAccountDisplayed)}
        />
    );

    const truncatedAccountAddress = connectedAccountActive
        ? trimString(userAddress ?? '', 6, 6, '…')
        : trimString(resolvedAddress, 6, 6, '…');

    const jazziconsToDisplay =
        (resolvedAddress || connectedAccountActive) && myJazzicon
            ? myJazzicon
            : null;

    const userLink = ensName ?? userAddress;

    // determine size of banner to properly make width of background
    // DOM id for parent element (needed to know SVG dimensions)
    const BANNER_ID = 'portfolio_banner_elem';
    // JSX DOM element to show noisy lines as an SVG, runs when the DOM
    // ... gets a new address for programmatic generation
    const noisyLines = useMemo<JSX.Element | null>(() => {
        // early return if address is not available (first render)
        if (!addressOfAccountDisplayed || !desktopScreen) return null;
        // locate rendered parent element in DOM by element ID
        const parentElem: HTMLElement | null =
            document.getElementById(BANNER_ID);
        // dimensions of parent element with backups
        const width: number = parentElem ? parentElem.offsetWidth : 1825;
        const height: number = parentElem ? parentElem.offsetHeight : 200;
        // render SVG image for DOM using derived dimensions
        return (
            <NoisyLines
                numLines={10}
                width={width}
                height={height}
                opacityStart={0.01}
                opacityMid={1}
                opacityEnd={0.0}
                opacityMidPosition={0.8}
                amplitudeStart={160}
                amplitudeMid={150}
                amplitudeEnd={0.01}
                amplitudeMidPosition={0.95}
                noiseScale={0.008}
                noiseStart={0.01}
                noiseMid={0.9}
                noiseEnd={1}
                noiseMidPosition={0.8}
                seed={addressOfAccountDisplayed}
                animationDuration={3000}
               
            />
        );
    }, [addressOfAccountDisplayed, document.getElementById(BANNER_ID)]);

    // early return is needed if the user is logged out
    if (!addressOfAccountDisplayed) return null;



    return (
   
        <div className={styles.portfolio_banner_rectangle_container} id={BANNER_ID}>

          
            { noisyLines}
            <div className={styles.portfolio_banner_rectangle_content}
            >
                <PortfolioBannerAccount
                    ensName={ensName}
                    ensNameAvailable={ensNameAvailable}
                    resolvedAddress={resolvedAddress}
                    truncatedAccountAddress={truncatedAccountAddress}
                    jazziconsToDisplay={jazziconsToDisplay}
                    connectedAccountActive={connectedAccountActive}
                    showTabsAndNotExchange={showTabsAndNotExchange}
                    setShowTabsAndNotExchange={setShowTabsAndNotExchange}
                />
         {desktopScreen &&       <DefaultTooltip
                    interactive
                    title={'Toggle USD Price Estimates'}
                    enterDelay={500}
                >
                    <button className={styles.header_button}
                        onClick={() =>
                            setIsTradeDollarizationEnabled((prev) => !prev)
                        }
                        style={{ zIndex: '2' }}
                    >
                        <AiOutlineDollarCircle
                            size={20}
                            id='trade_dollarized_prices_button'
                            aria-label='Toggle dollarized prices button'
                            style={{
                                color: isTradeDollarizationEnabled
                                    ? 'var(--accent1)'
                                    : undefined,
                            }}
                        />
                    </button>
                </DefaultTooltip>}
            </div>

            <div className={styles.portfolio_banner_level_container}>
                
     
                <UserLevelDisplay
                    currentLevel={xpData?.data?.currentLevel}
                    globalPoints={xpData?.data?.globalPoints}
                    user={userLink}
                />
            </div>
            </div>
    );
}