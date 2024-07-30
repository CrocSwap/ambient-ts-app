// START: Import React and Dongles
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

// START: Import JSX Components
import PortfolioBannerAccount from './PortfolioBannerAccount/PortfolioBannerAccount';

// START: Import Other Local Files
import { trimString } from '../../../ambient-utils/dataLayer';
import {
    PortfolioBannerLevelContainer,
    PortfolioBannerRectangleContainer,
} from '../../../styled/Components/Portfolio';
import NoisyLines from '../../NoisyLines/NoisyLines';
import {
    UserDataContext,
    UserXpDataIF,
} from '../../../contexts/UserDataContext';
import { useContext, useMemo } from 'react';
import UserLevelDisplay from '../../Global/LevelsCard/UserLevelDisplay';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { DefaultTooltip } from '../../Global/StyledTooltip/StyledTooltip';
import { AiOutlineDollarCircle } from 'react-icons/ai';
import { HeaderButtons } from '../../../styled/Components/Chart';
import { PoolContext } from '../../../contexts/PoolContext';
import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT } from '../../../ambient-utils/constants';
import { GraphDataContext } from '../../../contexts/GraphDataContext';
interface propsIF {
    ensName: string;
    resolvedAddress: string;
    connectedAccountActive: boolean;
    resolvedUserXp: UserXpDataIF;
}

export default function PortfolioBanner(props: propsIF) {
    const { ensName, resolvedAddress, connectedAccountActive, resolvedUserXp } =
        props;
    const { userAddress } = useContext(UserDataContext);
    const { connectedUserXp } = useContext(ChainDataContext);
    const { positionsByUser } = useContext(GraphDataContext);

    const {
        activeTradeTab,
        //  setActiveTradeTab,
        hideEmptyPositionsOnAccount,
        setHideEmptyPositionsOnAccount,
    } = useContext(TradeTableContext);
    const { isTradeDollarizationEnabled, setIsTradeDollarizationEnabled } =
        useContext(PoolContext);
    const isSmallScreen = useMediaQuery('(max-width: 800px)');

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

    const userHasEmptyPositions = useMemo(
        () =>
            positionsByUser.positions.filter(
                (position) => position.positionLiq === 0,
            ).length > 0,
        [positionsByUser.positions],
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
        if (!addressOfAccountDisplayed) return null;
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
        <PortfolioBannerRectangleContainer
            id={BANNER_ID}
            style={{ position: 'relative' }}
        >
            {noisyLines}
            <FlexContainer
                justifyContent={isSmallScreen ? 'flex-start' : 'flex-end'}
                alignItems='baseline'
                gap={16}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    zIndex: 10,
                }} // Positioned above the NoisyLines component
            >
                <PortfolioBannerAccount
                    ensName={ensName}
                    ensNameAvailable={ensNameAvailable}
                    resolvedAddress={resolvedAddress}
                    truncatedAccountAddress={truncatedAccountAddress}
                    jazziconsToDisplay={jazziconsToDisplay}
                    connectedAccountActive={connectedAccountActive}
                />
                <DefaultTooltip
                    interactive
                    title={'Toggle USD Price Estimates'}
                    enterDelay={500}
                >
                    <HeaderButtons
                        mobileHide
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
                    </HeaderButtons>
                </DefaultTooltip>
                {activeTradeTab === 'liquidity' && (
                    // connectedAccountActive &&
                    // userHasEmptyPositions && (
                    <DefaultTooltip
                        interactive
                        title={'Toggle display of empty positions'}
                        enterDelay={500}
                    >
                        <FlexContainer
                            alignItems='center'
                            justifyContent='center'
                            onClick={() => {
                                console.log('hide empty positions');
                                localStorage.setItem(
                                    LS_KEY_HIDE_EMPTY_POSITIONS_ON_ACCOUNT,
                                    String(!hideEmptyPositionsOnAccount),
                                );
                                setHideEmptyPositionsOnAccount(
                                    !hideEmptyPositionsOnAccount,
                                );
                            }}
                            style={{
                                cursor: 'pointer',
                                color: hideEmptyPositionsOnAccount
                                    ? 'var(--accent1)'
                                    : 'var(--text2)',
                            }}
                        >
                            <span>Hide Empty Positions</span>
                        </FlexContainer>
                    </DefaultTooltip>
                )}
            </FlexContainer>

            <PortfolioBannerLevelContainer
                isAccountPage
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    zIndex: 10,
                }} // Positioned above the NoisyLines component
            >
                <UserLevelDisplay
                    currentLevel={xpData?.data?.currentLevel}
                    globalPoints={xpData?.data?.globalPoints}
                    user={userLink}
                />
            </PortfolioBannerLevelContainer>
        </PortfolioBannerRectangleContainer>
    );
}
