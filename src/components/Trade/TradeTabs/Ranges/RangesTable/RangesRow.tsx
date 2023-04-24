import { useEffect, Dispatch, SetStateAction, useRef, useState } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';

import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import RangeDetails from '../../../../RangeDetails/RangeDetails';

import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import { IS_LOCAL_ENV } from '../../../../../constants';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { SpotPriceFn } from '../../../../../App/functions/querySpotPrice';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { allDexBalanceMethodsIF } from '../../../../../App/hooks/useExchangePrefs';
import { allSlippageMethodsIF } from '../../../../../App/hooks/useSlippage';
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
        } else {
            openDetailsModal();
        }
    };

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
        valueWithTooltip,
        walletWithTooltip,
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
                {!showColumns && fullScreenMinDisplay}
                {!showColumns && fullScreenMaxDisplay}
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
