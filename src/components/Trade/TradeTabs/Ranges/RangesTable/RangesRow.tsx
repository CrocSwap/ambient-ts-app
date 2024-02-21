import {
    useEffect,
    useRef,
    useContext,
    memo,
    Dispatch,
    SetStateAction,
} from 'react';
import {
    PositionIF,
    RangeModalAction,
} from '../../../../../ambient-utils/types';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import rangeRowConstants from '../rangeRowConstants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import { RangeRow as RangeRowStyled } from '../../../../../styled/Components/TransactionTable';
import { UserDataContext } from '../../../../../contexts/UserDataContext';

interface propsIF {
    position: PositionIF;
    rank?: number;
    isAccountView: boolean;
    isLeaderboard?: boolean;
    tableView: 'small' | 'medium' | 'large';
    openDetailsModal: () => void;
    openActionModal: () => void;
    setRangeModalAction: Dispatch<SetStateAction<RangeModalAction>>;
}

function RangesRow(props: propsIF) {
    const {
        tableView,
        position,
        isAccountView,
        isLeaderboard,
        rank,
        openDetailsModal,
        openActionModal,
        setRangeModalAction,
    } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { showAllData: showAllDataSelection, currentPositionActive } =
        useContext(TradeTableContext);

    const { currentRangeInReposition, currentRangeInAdd } =
        useContext(RangeContext);

    // only show all data when on trade tabs page
    const showAllData = !isAccountView && showAllDataSelection;

    const { userAddress } = useContext(UserDataContext);

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
        isPositionInRange: isPositionInRange,
        isAmbient: isAmbient,
        lowRangeDisplay: ambientOrMin,
        highRangeDisplay: ambientOrMax,
        isDenomBase: isDenomBase,
        minRangeDenomByMoneyness: minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness: maxRangeDenomByMoneyness,
    };

    const rangeMenuProps = {
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        isPositionEmpty: isPositionEmpty,
        positionData: position,
        position: position,
        isAccountView: isAccountView,
        isPositionInRange: isPositionInRange,
    };

    const positionDomId =
        position.positionId === currentPositionActive
            ? `position-${position.positionId}`
            : '';

    const activePositionRef = useRef(null);

    const sideCharacter = isAccountView
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

    function scrollToDiv() {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
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
        position.positionId === currentPositionActive ? scrollToDiv() : null;
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
        rank,
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

    return (
        <>
            <RangeRowStyled
                size={tableView}
                account={isAccountView}
                leaderboard={isLeaderboard}
                active={
                    position.positionId === currentPositionActive ||
                    position.positionId === currentRangeInReposition ||
                    position.positionId === currentRangeInAdd
                }
                user={userNameToDisplay === 'You' && showAllData}
                onClick={openDetailsModal}
                id={positionDomId}
                ref={currentPositionActive ? activePositionRef : null}
            >
                {tableView === 'large' && rankingOrNull}
                {tableView === 'large' && rangeTimeWithTooltip}
                {isAccountView && tokenPair}
                {!isLeaderboard && tableView === 'large' && (
                    <div>{IDWithTooltip}</div>
                )}
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
                        openDetailsModal={openDetailsModal}
                        openActionModal={openActionModal}
                        setRangeModalAction={setRangeModalAction}
                        tableView={tableView}
                    />
                </div>
            </RangeRowStyled>
        </>
    );
}

export default memo(RangesRow);
