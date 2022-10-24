import { useEffect, Dispatch, SetStateAction } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';

interface RangesRowPropsIF {
    isUserLoggedIn: boolean;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    // portfolio?: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    // notOnTradeRoute?: boolean;
    // isAllPositionsEnabled: boolean;
    // tokenAAddress: string;
    // tokenBAddress: string;
    // isAuthenticated: boolean;
    // isDenomBase: boolean;
    account?: string;
    lastBlockNumber: number;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;
    // blockExplorer: string | undefined;
    isShowAllEnabled: boolean;
    position: PositionIF;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    isOnPortfolioPage: boolean;
    isLeaderboard?: boolean;
    idx: number;
}

export default function RangesRow(props: RangesRowPropsIF) {
    const {
        // showSidebar,
        ipadView,
        showColumns,
        isShowAllEnabled,
        position,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        isOnPortfolioPage,
        isLeaderboard,
        idx,
    } = props;

    const {
        posHash,
        posHashTruncated,
        userNameToDisplay,
        ownerId,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        userMatchesConnectedAccount,
        // isOrderFilled,

        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        // isOwnerActiveAccount,
        ensName,

        apyString,
        apyClassname,

        isPositionInRange,
        isAmbient,

        ambientMinOrNull,
        ambientMaxOrNull,
        isDenomBase,
        // orderMatchesSelectedTokens,
    } = useProcessRange(position);

    const rangeDetailsProps = {
        crocEnv: props.crocEnv,
        provider: props.provider,
        chainData: props.chainData,
        chainId: props.chainId,
        poolIdx: position.poolIdx,
        isPositionInRange: isPositionInRange,
        isAmbient: isAmbient,
        user: position.user,
        bidTick: position.bidTick,
        askTick: position.askTick,
        baseTokenSymbol: position.baseSymbol,
        baseTokenDecimals: position.baseDecimals,
        quoteTokenSymbol: position.quoteSymbol,
        quoteTokenDecimals: position.quoteDecimals,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        lowRangeDisplay: ambientMinOrNull,
        highRangeDisplay: ambientMaxOrNull,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: props.lastBlockNumber,
        positionApy: position.apy,

        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
    };

    const rangeMenuProps = {
        crocEnv: props.crocEnv,
        chainData: props.chainData,
        posHash: posHash as string,
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        positionData: position,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        isOnPortfolioPage: props.isOnPortfolioPage,
    };

    const openDetailsModal = () => {
        openGlobalModal(<RangeDetails position={position} {...rangeDetailsProps} />);
    };

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    function scrollToDiv() {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        position.positionStorageSlot === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled ? styles.border_left : null;

    const usernameStyle = ensName || userMatchesConnectedAccount ? 'gradient_text' : 'base_color';

    const activePositionStyle =
        position.positionStorageSlot === currentPositionActive ? styles.active_position_style : '';

    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={posHash.toString()}
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <li onClick={openDetailsModal} data-label='id' className='base_color'>
                {posHashTruncated}
            </li>
        </DefaultTooltip>
    );

    const walletWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ownerId}</p>
                    <NavLink to={`/${ownerId}`}>View Account</NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={400}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='wallet'
                className={usernameStyle}
                style={{ textTransform: 'lowercase' }}
            >
                {userNameToDisplay}
            </li>
        </DefaultTooltip>
    );

    // portfolio page li element ---------------
    const accountTokenImages = (
        <li className={styles.token_images_account}>
            <img src={baseTokenLogo} alt='base token' />
            <img src={quoteTokenLogo} alt='quote token' />
            {/* <p>hello</p> */}
        </li>
    );

    const poolName = (
        <li className='base_color'>
            {baseTokenSymbol} / {quoteTokenSymbol}
        </li>
    );
    // end of portfolio page li element ---------------

    // Leaderboard content--------------------------------

    // End of Leaderboard content--------------------------------

    return (
        <ul
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            onClick={() =>
                position.positionStorageSlot === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            id={positionDomId}
        >
            {idx}
            {isOnPortfolioPage && accountTokenImages}
            {isOnPortfolioPage && !props.showSidebar && poolName}
            {!showColumns && IDWithTooltip}
            {!showColumns && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{posHashTruncated}</p>{' '}
                    <p className={usernameStyle} style={{ textTransform: 'lowercase' }}>
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='min price' className='color_white'>
                    {ambientMinOrNull}
                </li>
            )}

            {!showColumns && (
                <li onClick={openDetailsModal} data-label='max price' className='color_white'>
                    {ambientMaxOrNull}
                </li>
            )}

            {showColumns && !ipadView && (
                <li data-label='side-type' className='color_white'>
                    <p>{ambientMinOrNull}</p>
                    <p>{ambientMaxOrNull}</p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value' className='gradient_text'>
                {' '}
                {'$' + usdValue}
            </li>

            {!showColumns && (
                <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='base_color'>
                    <p>{baseDisplay}</p>
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label={quoteTokenSymbol} className='base_color'>
                    <p>{quoteDisplay}</p>
                </li>
            )}
            {showColumns && (
                <li data-label={baseTokenSymbol + quoteTokenSymbol} className='base_color'>
                    <p className={styles.align_center}>
                        {' '}
                        <img src={baseTokenLogo} alt='' width='15px' />
                        {baseDisplay}{' '}
                    </p>

                    <p className={styles.align_center}>
                        {' '}
                        <img src={quoteTokenLogo} alt='' width='15px' />
                        {quoteDisplay}
                    </p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value'>
                {' '}
                <p className={apyClassname}>{apyString}</p>
            </li>
            <li onClick={openDetailsModal} data-label='status' className='gradient_text'>
                <RangeStatus isInRange={isPositionInRange} isAmbient={isAmbient} justSymbol />
            </li>

            <li data-label='menu'>
                <RangesMenu {...rangeMenuProps} showSidebar={props.showSidebar} />
            </li>
        </ul>
    );
}
