import { memo, useContext, useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
    PositionIF,
    RangeModalAction,
} from '../../../../../ambient-utils/types';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import styles from './TableMenus.module.css';

import { AppStateContext } from '../../../../../contexts';
import { RangeContext } from '../../../../../contexts/RangeContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../../styled/Common';
import {
    linkGenMethodsIF,
    poolParamsIF,
    useLinkGen,
} from '../../../../../utils/hooks/useLinkGen';
import { Chip } from '../../../../Form/Chip';

// interface for React functional component props
interface propsIF {
    userMatchesConnectedAccount: boolean | undefined;
    // todoFromJr: Assign the correct types to these data -Jr
    // eslint-disable-next-line
    rangeDetailsProps: any;
    position: PositionIF;
    isPositionEmpty: boolean;
    isPositionInRange: boolean;
    handleWalletLinkClick: () => void;
    isAccountView: boolean;
    openDetailsModal: () => void;
    openActionModal: () => void;
    setRangeModalAction: React.Dispatch<React.SetStateAction<RangeModalAction>>;
    tableView: 'small' | 'medium' | 'large';
}

// React functional component
function RangesMenu(props: propsIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        isPositionEmpty,
        userMatchesConnectedAccount,
        rangeDetailsProps,
        position,
        isPositionInRange,
        isAccountView,
        openDetailsModal: openRangeDetailsModal,
        openActionModal: openRangeActionModal,
        setRangeModalAction,
        tableView,
    } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        setRangeTicksCopied,
        setSimpleRangeWidth,
        setCurrentRangeInReposition,
        setCurrentRangeInAdd,
        setAdvancedHighTick,
        setAdvancedLowTick,
        setAdvancedMode,
    } = useContext(RangeContext);
    const { sidebar } = useContext(SidebarContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);

    const { isAmbient } = rangeDetailsProps;

    const openDetailsModal = () => {
        setShowDropdownMenu(false);
        openRangeDetailsModal();
    };

    const openActionModal = (type: RangeModalAction) => {
        setShowDropdownMenu(false);
        setRangeModalAction(type);
        openRangeActionModal();
    };

    const { isUserConnected } = useContext(UserDataContext);

    const { tokenA, tokenB, getDefaultRangeWidthForTokenPair } =
        useContext(TradeDataContext);
    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    // ----------------------

    // const view1 = useMediaQuery('(max-width: 600px)');
    // const view3 = useMediaQuery('(min-width: 1800px)');

    const showRepositionButton =
        !isPositionInRange && !isPositionEmpty && userMatchesConnectedAccount;

    const feesAvailableForHarvest =
        (position.feesLiqBase || 0) + (position.feesLiqQuote || 0) > 0;

    const showAbbreviatedCopyTradeButton = isAccountView
        ? sidebar.isOpen
            ? useMediaQuery('(max-width: 1300px)')
            : useMediaQuery('(max-width: 1150px)')
        : sidebar.isOpen
          ? useMediaQuery('(max-width: 1400px)')
          : useMediaQuery('(max-width: 1150px)');

    const positionMatchesLoggedInUser =
        userMatchesConnectedAccount && isUserConnected;

    const handleCopyClick = () => {
        setActiveMobileComponent('trade');

        setRangeTicksCopied(true);
        handlePulseAnimation('range');

        if (position.positionType === 'ambient') {
            setSimpleRangeWidth(100);
            setAdvancedMode(false);
        } else {
            setAdvancedLowTick(position.bidTick);
            setAdvancedHighTick(position.askTick);
            setAdvancedMode(true);
        }
        setShowDropdownMenu(false);
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenRepo: linkGenMethodsIF = useLinkGen('reposition');

    const shouldCopyQuoteToTokenA =
        tokenAAddress.toLowerCase() === position.quote.toLowerCase() ||
        tokenBAddress.toLowerCase() === position.base.toLowerCase();

    const repositionButton = (
        <Link
            id={`reposition_button_${position.positionId}`}
            className={styles.reposition_button}
            to={linkGenRepo.getFullURL({
                chain: chainId,
                tokenA: shouldCopyQuoteToTokenA
                    ? position.quote
                    : position.base,
                tokenB: shouldCopyQuoteToTokenA
                    ? position.base
                    : position.quote,
                lowTick: position.bidTick.toString(),
                highTick: position.askTick.toString(),
            })}
            onClick={() => {
                setActiveMobileComponent('trade');
                setSimpleRangeWidth(
                    getDefaultRangeWidthForTokenPair(
                        position.chainId,
                        position.base.toLowerCase(),
                        position.quote.toLowerCase(),
                    ),
                );
                setCurrentRangeInReposition(position.positionId);
                setCurrentRangeInAdd('');
            }}
            state={{ position: position }}
        >
            Reposition
        </Link>
    );

    const removeButton = positionMatchesLoggedInUser ? (
        <Chip
            id={`remove_position_${position.positionId}`}
            onClick={() => openActionModal('Remove')}
        >
            Remove
        </Chip>
    ) : null;

    const copyButton = position ? (
        <Chip
            onClick={() => {
                // URL params for link to pool page
                const poolLinkParams: poolParamsIF = {
                    chain: chainId,
                    tokenA:
                        tokenAAddress.toLowerCase() ===
                        position.quote.toLowerCase()
                            ? position.quote
                            : position.base,
                    tokenB:
                        tokenAAddress.toLowerCase() ===
                        position.quote.toLowerCase()
                            ? position.base
                            : position.quote,
                    lowTick: position.bidTick.toString(),
                    highTick: position.askTick.toString(),
                };
                // navigate user to pool page with URL params defined above
                linkGenPool.navigate(poolLinkParams);
                handleCopyClick();
            }}
        >
            {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
        </Chip>
    ) : null;

    const addButton = (
        <Chip
            id={`add_liquidity_position_${position.positionId}`}
            onClick={() => {
                // URL params for link to pool page
                const poolLinkParams: poolParamsIF = {
                    chain: chainId,
                    tokenA:
                        tokenAAddress.toLowerCase() ===
                        position.quote.toLowerCase()
                            ? position.quote
                            : position.base,
                    tokenB:
                        tokenAAddress.toLowerCase() ===
                        position.quote.toLowerCase()
                            ? position.base
                            : position.quote,
                    lowTick: position.bidTick.toString(),
                    highTick: position.askTick.toString(),
                };
                // navigate user to pool page with URL params defined above
                linkGenPool.navigate(poolLinkParams);
                handleCopyClick();
                setCurrentRangeInAdd(position.positionId);
            }}
        >
            Add
        </Chip>
    );

    const detailsButton = <Chip onClick={openDetailsModal}>Details</Chip>;
    const harvestButton =
        !isAmbient &&
        positionMatchesLoggedInUser &&
        // show harvest button if fees are available for harvest or if on mainnet
        (feesAvailableForHarvest || chainId === '0x1') ? (
            <Chip
                id={`harvest_position_${position.positionId}`}
                onClick={() => openActionModal('Harvest')}
            >
                Harvest
            </Chip>
        ) : null;

    // ----------------------

    const walletButton = (
        <Chip ariaLabel='View wallet.' onClick={props.handleWalletLinkClick}>
            Wallet
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </Chip>
    );

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {tableView !== 'small' && showRepositionButton && repositionButton}
            {tableView !== 'small' &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {(tableView === 'large' ||
                (!showRepositionButton && tableView !== 'small')) &&
                !isPositionEmpty &&
                removeButton}
            {tableView === 'large' && !isPositionEmpty && harvestButton}
            {!userMatchesConnectedAccount &&
                tableView !== 'small' &&
                copyButton}
        </div>
    );

    const dropdownMenuContent = (
        <div className={styles.menu_column}>
            {tableView === 'small' &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {tableView !== 'large' && !isPositionEmpty && harvestButton}
            {(tableView === 'small' ||
                (showRepositionButton && tableView !== 'large')) &&
                !isPositionEmpty &&
                removeButton}
            {detailsButton}
            {!isAccountView && walletButton}
            {tableView === 'small' && showRepositionButton && repositionButton}
            {!userMatchesConnectedAccount &&
                tableView === 'small' &&
                copyButton}
        </div>
    );

    const [showDropdownMenu, setShowDropdownMenu] = useState(false);

    const wrapperStyle = showDropdownMenu
        ? styles.dropdown_wrapper_active
        : styles.dropdown_wrapper;

    const clickOutsideHandler = () => {
        setShowDropdownMenu(false);
    };

    UseOnClickOutside(menuItemRef, clickOutsideHandler);
    const dropdownRangesMenu = (
        <div className={styles.dropdown_menu} ref={menuItemRef}>
            <div
                onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                className={styles.dropdown_button}
            >
                <CiCircleMore size={25} color='var(--text1)' />
            </div>
            <div className={wrapperStyle}>{dropdownMenuContent}</div>
        </div>
    );

    useEffect(() => {
        if (showDropdownMenu) {
            const interval = setTimeout(() => {
                setShowDropdownMenu(false);
            }, 5000);
            return () => clearTimeout(interval);
        } else return;
    }, [showDropdownMenu]);

    return (
        <FlexContainer justifyContent='flex-end'>
            <div
                onClick={(event) => event.stopPropagation()}
                style={{ width: 'min-content', cursor: 'default' }}
                className={styles.main_container}
            >
                {rangesMenu}
                {dropdownRangesMenu}
            </div>
        </FlexContainer>
    );
}

export default memo(RangesMenu);
