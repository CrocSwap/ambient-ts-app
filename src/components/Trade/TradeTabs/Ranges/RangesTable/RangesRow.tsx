import { useEffect, useRef, useContext, memo } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import rangeRowConstants from '../rangeRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import { useModal } from '../../../../Global/Modal/useModal';
import RangeDetailsModal from '../../../../RangeDetails/RangeDetailsModal/RangeDetailsModal';
import { RangeRow as RangeRowStyled } from '../../../../../styled/Components/TransactionTable';

interface propsIF {
    position: PositionIF;
    rank?: number;
    isAccountView: boolean;
    isLeaderboard?: boolean;
    tableView: 'small' | 'medium' | 'large';
}

function RangesRow(props: propsIF) {
    const { tableView, position, isAccountView, isLeaderboard } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const {
        showAllData: showAllDataSelection,
        currentPositionActive,
        setCurrentPositionActive,
    } = useContext(TradeTableContext);

    const { currentRangeInReposition, currentRangeInAdd } =
        useContext(RangeContext);

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

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
        baseTokenAddress,
        quoteTokenAddress,
    } = useProcessRange(position, userAddress, isAccountView);

    const rangeDetailsProps = {
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
        lowRangeDisplay: ambientOrMin,
        highRangeDisplay: ambientOrMax,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        positionApy: position.apy,
        minRangeDenomByMoneyness: minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness: maxRangeDenomByMoneyness,
    };

    const rangeMenuProps = {
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        isPositionEmpty: isPositionEmpty,
        positionData: position,
        position: position,
        isAccountView: props.isAccountView,
        isPositionInRange: isPositionInRange,
    };

    const positionDomId =
        position.firstMintTx === currentPositionActive
            ? `position-${position.firstMintTx}`
            : '';

    const activePositionRef = useRef(null);

    const sideCharacter = isAccountView
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
    const [_, copy] = useCopyToClipboard();

    function handleWalletCopy() {
        copy(ownerId);
        openSnackbar(`${ownerId} copied`, 'info');
    }

    function handleCopyPosHash() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    useEffect(() => {
        position.firstMintTx === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const usernameColor: 'text1' | 'accent1' | 'accent2' =
        isOwnerActiveAccount && showAllData
            ? 'accent2'
            : ensName || userNameToDisplay === 'You'
            ? 'accent1'
            : 'text1';

    function handleWalletLinkClick() {
        if (!isAccountView)
            window.open(
                `/${
                    isOwnerActiveAccount
                        ? 'account'
                        : ensName
                        ? ensName
                        : ownerId
                }`,
            );
    }

    const handleAccountClick = () => {
        if (!isAccountView) {
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
        handleWalletLinkClick,
        handleWalletCopy,
        ownerId,
        ensName,
        userNameToDisplay,
        isOwnerActiveAccount,
        usernameColor,
        baseTokenLogo,
        quoteTokenLogo,
        position,
        baseTokenSymbol,
        quoteTokenSymbol,
        isLeaderboard,
        rank: props.rank,
        elapsedTimeString,
        maxRangeDenomByMoneyness,
        isAccountView,
        isAmbient,
        minRangeDenomByMoneyness,
        ambientOrMin,
        ambientOrMax,
        sideCharacter,
        apyString,
        apyClassname,
        isPositionInRange,
        baseTokenAddress,
        quoteTokenAddress,
    };

    const {
        valueWithTooltip,
        walletWithTooltip,
        tokenPair,
        IDWithTooltip,
        rankingOrNull,
        baseQtyDisplayWithTooltip,
        quoteQtyDisplayWithTooltip,
        rangeTimeWithTooltip,
        txIdColumnComponent,
        fullScreenMinDisplay,
        fullScreenMaxDisplay,
        priceDisplay,
        tokenValues,
        apyDisplay,
        rangeDisplay,
    } = rangeRowConstants(rangeRowConstantsProps);

    function handleRowClick() {
        if (position.firstMintTx === currentPositionActive) {
            return;
        }
        setCurrentPositionActive('');
        openDetailsModal();
    }

    return (
        <>
            <RangeRowStyled
                size={tableView}
                account={isAccountView}
                leaderboard={isLeaderboard}
                active={
                    position.firstMintTx === currentPositionActive ||
                    position.positionId === currentRangeInReposition ||
                    position.positionId === currentRangeInAdd
                }
                user={userNameToDisplay === 'You' && showAllData}
                onClick={handleRowClick}
                id={positionDomId}
                ref={currentPositionActive ? activePositionRef : null}
            >
                {tableView === 'large' && rankingOrNull}
                {tableView === 'large' && rangeTimeWithTooltip}
                {isAccountView && tokenPair}
                {tableView === 'large' && <div>{IDWithTooltip}</div>}
                {tableView === 'large' && !isAccountView && (
                    <div>{walletWithTooltip}</div>
                )}
                {tableView !== 'large' && txIdColumnComponent}
                {tableView === 'large' && fullScreenMinDisplay}
                {tableView === 'large' && fullScreenMaxDisplay}
                {tableView === 'medium' && priceDisplay}
                {valueWithTooltip}
                {tableView === 'large' && baseQtyDisplayWithTooltip}
                {tableView === 'large' && quoteQtyDisplayWithTooltip}
                {tableView === 'medium' && tokenValues}
                {apyDisplay}
                {rangeDisplay}
                <div data-label='menu'>
                    <RangesMenu
                        {...rangeMenuProps}
                        isEmpty={position.totalValueUSD === 0}
                        handleAccountClick={handleAccountClick}
                        isAccountView={isAccountView}
                    />
                </div>
            </RangeRowStyled>
            {isDetailsModalOpen && (
                <RangeDetailsModal
                    position={position}
                    {...rangeDetailsProps}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isAccountView={isAccountView}
                    onClose={closeDetailsModal}
                />
            )}
        </>
    );
}

export default memo(RangesRow);
