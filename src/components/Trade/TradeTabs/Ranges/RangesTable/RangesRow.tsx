import {
    Dispatch,
    memo,
    MutableRefObject,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
} from 'react';
import {
    PositionIF,
    RangeModalAction,
} from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { RangeRow as RangeRowStyled } from '../../../../../styled/Components/TransactionTable';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import rangeRowConstants from '../rangeRowConstants';

interface propsIF {
    position: PositionIF;
    rank?: number;
    isAccountView: boolean;
    isLeaderboard?: boolean;
    tableView: 'small' | 'medium' | 'large';
    openDetailsModal: () => void;
    openActionModal: () => void;
    setRangeModalAction: Dispatch<SetStateAction<RangeModalAction>>;
    observedRowRef: MutableRefObject<HTMLDivElement | null> | undefined;
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
        observedRowRef,
    } = props;
    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);
    const { showAllData: showAllDataSelection, currentPositionActive } =
        useContext(TradeTableContext);
    const { crocEnv } = useContext(CrocEnvContext);

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
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
    } = useProcessRange(position, crocEnv, userAddress, isAccountView);

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

    function scrollToDiv(block?: 'start' | 'center' | 'end' | 'nearest') {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({
            behavior: 'smooth',
            block: block || 'nearest',
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
        position.onChainConstructedPosition &&
        position.positionId === currentPositionActive
            ? // scroll to show the placeholder and unindexed position row
              scrollToDiv('end')
            : null;
    }, [position.onChainConstructedPosition]);

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
                        ? 'account' + '/liquidity'
                        : ensName
                          ? ensName + '/liquidity'
                          : ownerId + '/liquidity'
                }`,
            );
    }

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
        lowDisplayPriceInUsd,
        highDisplayPriceInUsd,
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
        isBaseTokenMoneynessGreaterOrEqual,
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
        fullScreenMinDisplay,
        fullScreenMaxDisplay,
        priceDisplay,
        tokenValues,
        apyDisplay,
        rangeDisplay,
        hiddenIDColumn,
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
                data-type='infinite-scroll-row'
            >
                {hiddenIDColumn}
                {tableView === 'large' && rankingOrNull}
                {tableView === 'large' && rangeTimeWithTooltip}
                {isAccountView && tokenPair}
                {!isLeaderboard && !isAccountView && tableView === 'large' && (
                    <div>{IDWithTooltip}</div>
                )}
                {!isAccountView && walletWithTooltip}
                {tableView !== 'small' && isAccountView && IDWithTooltip}
                {tableView === 'large' && fullScreenMinDisplay}
                {tableView === 'large' && fullScreenMaxDisplay}
                {tableView === 'medium' && priceDisplay}
                {valueWithTooltip}
                {tableView === 'large' && baseQtyDisplayWithTooltip}
                {tableView === 'large' && quoteQtyDisplayWithTooltip}
                {tableView === 'medium' && tokenValues}
                {apyDisplay}
                {rangeDisplay}
                <div data-label='menu' ref={observedRowRef}>
                    <RangesMenu
                        {...rangeMenuProps}
                        handleWalletLinkClick={handleWalletLinkClick}
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
