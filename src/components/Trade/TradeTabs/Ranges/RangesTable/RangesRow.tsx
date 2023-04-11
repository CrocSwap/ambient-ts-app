import { useEffect, Dispatch, SetStateAction, useRef, useState } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';

import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import { TextOnlyTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import Medal from '../../../../Global/Medal/Medal';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../../constants';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { SpotPriceFn } from '../../../../../App/functions/querySpotPrice';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { allDexBalanceMethodsIF } from '../../../../../App/hooks/useExchangePrefs';
import { allSlippageMethodsIF } from '../../../../../App/hooks/useSlippage';
import { FiExternalLink, FiCopy } from 'react-icons/fi';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../../Global/SnackbarComponent/SnackbarComponent';
import rangeRowConstants from '../rangeRowConstants';

interface propsIF {
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    account: string;
    lastBlockNumber: number;
    showSidebar: boolean;
    showPair: boolean;
    ipadView: boolean;
    showColumns: boolean;
    isShowAllEnabled: boolean;
    position: PositionIF;
    rank?: number;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    isOnPortfolioPage: boolean;
    isLeaderboard?: boolean;
    idx: number;
    handlePulseAnimation?: (type: string) => void;
    cachedQuerySpotPrice: SpotPriceFn;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
    dexBalancePrefs: allDexBalanceMethodsIF;
    slippage: allSlippageMethodsIF;
    gasPriceInGwei: number | undefined;
    ethMainnetUsdPrice: number | undefined;
}

export default function RangesRow(props: propsIF) {
    const {
        chainId,
        cachedQuerySpotPrice,
        account,
        ipadView,
        showColumns,
        showPair,
        isShowAllEnabled,
        position,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        isOnPortfolioPage,
        isLeaderboard,
        handlePulseAnimation,
        setSimpleRangeWidth,
        dexBalancePrefs,
        slippage,
        gasPriceInGwei,
        ethMainnetUsdPrice,
    } = props;

    const {
        posHash,
        posHashTruncated,
        userNameToDisplay,
        ownerId,
        quoteTokenLogo,
        baseTokenLogo,
        userMatchesConnectedAccount,
        usdValue,
        // usdValueLocaleString,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,
        apyString,
        apyClassname,
        isPositionInRange,
        isPositionEmpty,
        isAmbient,
        baseTokenCharacter,
        quoteTokenCharacter,
        ambientOrMin,
        ambientOrMax,
        isDenomBase,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        elapsedTimeString,
    } = useProcessRange(position, account, isOnPortfolioPage);

    const rangeDetailsProps = {
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        crocEnv: props.crocEnv,
        provider: props.provider,
        chainData: props.chainData,
        chainId: chainId,
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
        lowRangeDisplay: ambientOrMin,
        highRangeDisplay: ambientOrMax,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: props.lastBlockNumber,
        positionApy: position.apy,

        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        minRangeDenomByMoneyness: minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness: maxRangeDenomByMoneyness,
    };

    const rangeMenuProps = {
        crocEnv: props.crocEnv,
        chainData: props.chainData,
        posHash: posHash as string,
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        isPositionEmpty: isPositionEmpty,
        positionData: position,
        position: position,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        isOnPortfolioPage: props.isOnPortfolioPage,
        handlePulseAnimation: handlePulseAnimation,
        isPositionInRange: isPositionInRange,
        gasPriceInGwei: gasPriceInGwei,
        ethMainnetUsdPrice: ethMainnetUsdPrice,
    };

    const openDetailsModal = () => {
        IS_LOCAL_ENV && console.debug({ position });
        openGlobalModal(
            <RangeDetails
                position={position}
                account={account}
                {...rangeDetailsProps}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isOnPortfolioPage={isOnPortfolioPage}
            />,
        );
    };

    const dispatch = useAppDispatch();

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const activePositionRef = useRef(null);

    const sideCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    const clickOutsideHandler = () => {
        setCurrentPositionActive('');
    };
    useOnClickOutside(activePositionRef, clickOutsideHandler);

    function scrollToDiv() {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
            inline: 'nearest',
        });
    }
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();
    const [valueToCopy, setValueToCopy] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {valueToCopy} copied
        </SnackbarComponent>
    );

    function handleWalletCopy() {
        setValueToCopy(ownerId);
        copy(ownerId);

        setOpenSnackbar(true);
    }

    function handleCopyPosHash() {
        setValueToCopy(posHash.toString());
        copy(posHash.toString());

        setOpenSnackbar(true);
    }

    useEffect(() => {
        position.positionStorageSlot === currentPositionActive
            ? scrollToDiv()
            : null;
    }, [currentPositionActive]);

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled
            ? styles.border_left
            : null;

    const usernameStyle =
        isOwnerActiveAccount && (isShowAllEnabled || isLeaderboard)
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'username_base_color';

    const activePositionStyle =
        position.positionStorageSlot === currentPositionActive
            ? styles.active_position_style
            : '';

    const [highlightRow, setHighlightRow] = useState(false);
    const highlightStyle = highlightRow ? 'var(--dark2)' : '';
    const handleRowMouseDown = () => setHighlightRow(true);
    const handleRowMouseOut = () => setHighlightRow(false);

    // const IDWithTooltip = (
    //     <TextOnlyTooltip
    //         interactive
    //         title={
    //             <p
    //                 style={{
    //                     marginLeft: '-60px',

    //                     background: 'var(--dark3)',
    //                     color: 'var(--text-grey-white)',
    //                     padding: '12px',
    //                     borderRadius: '4px',
    //                     cursor: 'default',

    //                     fontFamily: 'monospace',

    //                     whiteSpace: 'nowrap',
    //                     width: '440px',

    //                     display: 'flex',
    //                     alignItems: 'center',
    //                     gap: '4px',
    //                 }}
    //             >
    //                 {posHash.toString()}
    //                 <FiCopy
    //                     style={{ cursor: 'pointer' }}
    //                     onClick={handleCopyPosHash}
    //                 />
    //             </p>
    //         }
    //         placement={'right'}
    //         enterDelay={750}
    //         leaveDelay={0}
    //     >
    //         <p
    //             onClick={openDetailsModal}
    //             data-label='id'
    //             className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
    //         >
    //             {posHashTruncated}
    //         </p>
    //     </TextOnlyTooltip>
    // );

    // const ValueWithTooltip = (
    //     <li
    //         onClick={openDetailsModal}
    //         data-label='value'
    //         className='base_color'
    //         style={{ textAlign: 'right' }}
    //         onMouseEnter={handleRowMouseDown}
    //         onMouseLeave={handleRowMouseOut}
    //     >
    //         {' '}
    //         {'$' + usdValue}
    //     </li>
    // );
    function handleWalletLinkClick() {
        if (!isOnPortfolioPage)
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: isOnPortfolioPage ? false : true,
                }),
            );

        window.open(
            `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`,
        );
    }

    // const actualWalletWithTooltip = (
    //     <TextOnlyTooltip
    //         interactive
    //         title={
    //             <div
    //                 style={{
    //                     marginRight: '-80px',
    //                     background: 'var(--dark3)',
    //                     color: 'var(--text-grey-white)',
    //                     padding: '12px',
    //                     borderRadius: '4px',
    //                     cursor: 'default',

    //                     // width: '450px',
    //                 }}
    //             >
    //                 <p
    //                     style={{
    //                         fontFamily: 'monospace',
    //                         display: 'flex',
    //                         flexDirection: 'row',
    //                         alignItems: 'center',
    //                         whiteSpace: 'nowrap',

    //                         gap: '4px',
    //                     }}
    //                 >
    //                     {ownerId}
    //                     <FiCopy
    //                         style={{ cursor: 'pointer' }}
    //                         size={'12px'}
    //                         onClick={() => handleWalletCopy()}
    //                     />

    //                     <FiExternalLink
    //                         style={{ cursor: 'pointer' }}
    //                         size={'12px'}
    //                         onClick={handleWalletLinkClick}
    //                     />
    //                 </p>
    //             </div>
    //         }
    //         placement={'right'}
    //         enterDelay={750}
    //         leaveDelay={0}
    //     >
    //         <p
    //             onClick={openDetailsModal}
    //             data-label='wallet'
    //             className={usernameStyle}
    //             style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
    //         >
    //             {userNameToDisplay}
    //         </p>
    //     </TextOnlyTooltip>
    // );

    // const walletWithoutTooltip = (
    //     <p
    //         // onClick={handleWalletClick}
    //         onClick={openDetailsModal}
    //         data-label='wallet'
    //         className={`${usernameStyle} ${styles.hover_style}`}
    //         style={{ textTransform: 'lowercase' }}
    //         tabIndex={0}
    //     >
    //         {userNameToDisplay}
    //     </p>
    // );

    // const walletWithTooltip = isOwnerActiveAccount
    //     ? walletWithoutTooltip
    //     : actualWalletWithTooltip;
    // const baseTokenLogoComponent =
    //     baseTokenLogo !== '' ? (
    //         <img src={baseTokenLogo} alt='base token' width={logoSizes} />
    //     ) : (
    //         <NoTokenIcon
    //             tokenInitial={position.baseSymbol.charAt(0)}
    //             width={logoSizes}
    //         />
    //     );

    // const quoteTokenLogoComponent =
    //     quoteTokenLogo !== '' ? (
    //         <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
    //     ) : (
    //         <NoTokenIcon
    //             tokenInitial={position.quoteSymbol.charAt(0)}
    //             width={logoSizes}
    //         />
    //     );

    const pair =
        position.base !== ZERO_ADDRESS
            ? [
                  `${position.baseSymbol}: ${position.base}`,
                  `${position.quoteSymbol}: ${position.quote}`,
              ]
            : [`${position.quoteSymbol}: ${position.quote}`];
    // eslint-disable-next-line
    const tip = pair.join('\n');

    const tradeLinkPath =
        '/trade/range/chain=' +
        position.chainId +
        '&tokenA=' +
        position.quote +
        '&tokenB=' +
        position.base;

    // const tokenPair = (
    //     <li
    //         className='base_color'
    //         onMouseEnter={handleRowMouseDown}
    //         onMouseLeave={handleRowMouseOut}
    //     >
    //         <NavLink to={tradeLinkPath}>
    //             <p>
    //                 {baseTokenSymbol} / {quoteTokenSymbol}
    //             </p>
    //         </NavLink>
    //     </li>
    // );

    // end of portfolio page li element ---------------

    // Leaderboard content--------------------------------

    // const idOrNull =
    //     !isLeaderboard && !showColumns ? <li> {IDWithTooltip}</li> : null;

    // const rankingOrNull =
    //     isLeaderboard && !showColumns ? (
    //         <Medal ranking={props.rank ?? 80} />
    //     ) : null;

    // End of Leaderboard content--------------------------------

    // const baseQtyDisplayWithTooltip = (
    //     <li
    //         onClick={openDetailsModal}
    //         data-label={baseTokenSymbol}
    //         className='base_color'
    //         onMouseEnter={handleRowMouseDown}
    //         onMouseLeave={handleRowMouseOut}
    //     >
    //         <div
    //             style={{
    //                 display: 'flex',
    //                 alignItems: 'end',
    //                 justifyContent: 'flex-end',
    //                 gap: '4px',
    //                 textAlign: 'right',
    //                 whiteSpace: 'nowrap',
    //             }}
    //         >
    //             {position.positionLiqBaseTruncated || '0'}
    //             {baseTokenLogoComponent}
    //         </div>
    //     </li>
    // );
    // const quoteQtyDisplayWithTooltip = (
    //     <li
    //         onClick={openDetailsModal}
    //         data-label={quoteTokenSymbol}
    //         className='base_color'
    //         onMouseEnter={handleRowMouseDown}
    //         onMouseLeave={handleRowMouseOut}
    //     >
    //         <div
    //             style={{
    //                 display: 'flex',
    //                 alignItems: 'end',
    //                 justifyContent: 'flex-end',
    //                 gap: '4px',
    //                 textAlign: 'right',
    //                 whiteSpace: 'nowrap',
    //             }}
    //         >
    //             {position.positionLiqQuoteTruncated || '0'}
    //             {quoteTokenLogoComponent}
    //         </div>
    //     </li>
    // );

    // const RangeTimeWithTooltip = (
    //     <TextOnlyTooltip
    //         interactive
    //         title={
    //             <p
    //                 style={{
    //                     marginLeft: '-70px',
    //                     background: 'var(--dark3)',
    //                     color: 'var(--text-grey-white)',
    //                     padding: '12px',
    //                     borderRadius: '4px',
    //                     cursor: 'pointer',
    //                 }}
    //             >
    //                 {moment(position.latestUpdateTime * 1000).format(
    //                     'MM/DD/YYYY HH:mm',
    //                 )}
    //             </p>
    //         }
    //         placement={'right'}
    //         enterDelay={750}
    //         leaveDelay={0}
    //     >
    //         <li
    //             onClick={openDetailsModal}
    //             style={{ textTransform: 'lowercase' }}
    //             onMouseEnter={handleRowMouseDown}
    //             onMouseLeave={handleRowMouseOut}
    //         >
    //             <p className='base_color'>{elapsedTimeString}</p>
    //         </li>
    //     </TextOnlyTooltip>
    // );

    const [showHighlightedButton, setShowHighlightedButton] = useState(false);
    // eslint-disable-next-line
    const handleAccountClick = () => {
        if (!isOnPortfolioPage) {
            dispatch(
                setDataLoadingStatus({
                    datasetName: 'lookupUserTxData',
                    loadingStatus: true,
                }),
            );
            const accountUrl = `/${
                isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
            }`;
            window.open(accountUrl);
            // navigate(
            //     `/${
            //         isOwnerActiveAccount
            //             ? 'account'
            //             : ensName
            //             ? ensName
            //             : ownerId
            //     }`,
            // );
        } else {
            openDetailsModal();
        }
    };

    // const txIdColumnComponent = (
    //     <li>
    //         {IDWithTooltip}
    //         {walletWithTooltip}
    //     </li>
    // );
    const rangeRowConstantsProps = {
        handleCopyPosHash,
        posHash: posHash as string,
        posHashTruncated,
        usdValue,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        handleWalletLinkClick,
        handleWalletCopy,
        ownerId,
        userNameToDisplay,
        isOwnerActiveAccount,
        usernameStyle,
        baseTokenLogo,
        quoteTokenLogo,
        position,
        baseTokenSymbol,
        quoteTokenSymbol,
        isLeaderboard,
        showColumns,
        rank: props.rank,
        elapsedTimeString,

        maxRangeDenomByMoneyness,
        isOnPortfolioPage,
        isAmbient,

        minRangeDenomByMoneyness,
        ambientOrMin,
        ambientOrMax,
        sideCharacter,
        ipadView,
        apyString,
        apyClassname,
        isPositionInRange,
    };

    const {
        IDWithTooltip,
        valueWithTooltip,
        actualWalletWithTooltip,
        walletWithoutTooltip,
        walletWithTooltip,
        baseTokenLogoComponent,
        quoteTokenLogoComponent,
        tokenPair,
        idOrNull,
        rankingOrNull,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        rangeTimeWithTooltip,
        txIdColumnComponent,
        fullScreenMinDisplay,
        fullScreenMaxDisplay,
        columnNonAmbientPrice,
        columnAmbientPrice,
        tokenValues,
        apyDisplay,
        rangeDisplay,
    } = rangeRowConstants(rangeRowConstantsProps);

    return (
        <>
            <ul
                onMouseEnter={() => setShowHighlightedButton(true)}
                onMouseLeave={() => setShowHighlightedButton(false)}
                className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
                onClick={() =>
                    position.positionStorageSlot === currentPositionActive
                        ? null
                        : setCurrentPositionActive('')
                }
                id={positionDomId}
                ref={currentPositionActive ? activePositionRef : null}
                style={{ cursor: 'pointer', backgroundColor: highlightStyle }}
            >
                {rankingOrNull}
                {showPair && rangeTimeWithTooltip}
                {isOnPortfolioPage && showPair && tokenPair}
                {idOrNull}
                {!showColumns && !isOnPortfolioPage && (
                    <li>{walletWithTooltip}</li>
                )}
                {showColumns && txIdColumnComponent}
                {!showColumns ? fullScreenMinDisplay : null}
                {!showColumns ? fullScreenMaxDisplay : null}
                {columnNonAmbientPrice}
                {columnAmbientPrice}
                {valueWithTooltip}
                {!showColumns && baseQtyDisplayWithTooltip}
                {!showColumns && quoteQtyDisplayWithTooltip}
                {showColumns && !phoneScreen && tokenValues}
                {apyDisplay}
                {rangeDisplay}
                <li data-label='menu' className={styles.menu}>
                    <RangesMenu
                        {...rangeMenuProps}
                        showSidebar={props.showSidebar}
                        isEmpty={position.totalValueUSD === 0}
                        showHighlightedButton={showHighlightedButton}
                        setSimpleRangeWidth={setSimpleRangeWidth}
                        dexBalancePrefs={dexBalancePrefs}
                        slippage={slippage}
                        handleAccountClick={handleAccountClick}
                        isShowAllEnabled={isShowAllEnabled}
                    />
                </li>
            </ul>
            {snackbarContent}
        </>
    );
}
