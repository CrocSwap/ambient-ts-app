// START: Import React and Dongles
import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
import styles from './TableMenus.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setRangeTicksCopied,
} from '../../../../../utils/state/tradeDataSlice';
import { IS_LOCAL_ENV } from '../../../../../constants';
import { RangeContext } from '../../../../../contexts/RangeContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    poolParamsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import RangeActionModal from '../../../../RangeActionModal/RangeActionModal';
import { useModal } from '../../../Modal/useModal';
import RangeDetailsModal from '../../../../RangeDetails/RangeDetailsModal/RangeDetailsModal';
import { Chip } from '../../../../Form/Chip';
import { FlexContainer } from '../../../../../styled/Common';
import { UserDataContext } from '../../../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';

// interface for React functional component props
interface propsIF {
    userMatchesConnectedAccount: boolean | undefined;
    // todoFromJr: Assign the correct types to these data -Jr
    // eslint-disable-next-line
    rangeDetailsProps: any;
    position: PositionIF;
    isPositionEmpty: boolean;
    isEmpty: boolean;
    isPositionInRange: boolean;
    handleAccountClick: () => void;
    isAccountView: boolean;
}

export type RangeModalActionType = 'Harvest' | 'Remove';

// React functional component
export default function RangesMenu(props: propsIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        isEmpty,
        isPositionEmpty,
        userMatchesConnectedAccount,
        rangeDetailsProps,
        position,
        isPositionInRange,
        isAccountView,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const {
        setSimpleRangeWidth,
        setCurrentRangeInReposition,
        setCurrentRangeInAdd,
    } = useContext(RangeContext);
    const { sidebar } = useContext(SidebarContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);

    const { isAmbient } = rangeDetailsProps;

    const dispatch = useAppDispatch();

    // ---------------------MODAL FUNCTIONALITY----------------

    const [
        isRangeDetailsModalOpen,
        openRangeDetailsModal,
        closeRangeDetailsModal,
    ] = useModal();

    const [
        isRangeActionModalOpen,
        openRangeActionModal,
        closeRangeActionModal,
    ] = useModal();
    const [rangeModalAction, setRangeModalAction] =
        useState<RangeModalActionType>('Harvest');

    const openDetailsModal = () => {
        setShowDropdownMenu(false);
        openRangeDetailsModal();
    };

    const openActionModal = (type: RangeModalActionType) => {
        setShowDropdownMenu(false);
        setRangeModalAction(type);
        openRangeActionModal();
    };
    const handleActionModalClose = () => {
        setShowDropdownMenu(false);
        closeRangeActionModal();
    };

    const { isUserConnected } = useContext(UserDataContext);

    const { tokenA, tokenB } = useContext(TradeDataContext);
    const tokenAAddress = tokenA.address;
    const tokenBAddress = tokenB.address;

    // ----------------------

    const view1 = useMediaQuery('(max-width: 600px)');
    const view3 = useMediaQuery('(min-width: 1800px)');

    const showRepositionButton =
        !isPositionInRange && !isPositionEmpty && userMatchesConnectedAccount;

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

        dispatch(setRangeTicksCopied(true));
        handlePulseAnimation('range');

        if (position.positionType === 'ambient') {
            setSimpleRangeWidth(100);
            dispatch(setAdvancedMode(false));
        } else {
            IS_LOCAL_ENV && console.debug({ position });
            dispatch(setAdvancedLowTick(position.bidTick));
            dispatch(setAdvancedHighTick(position.askTick));
            dispatch(setAdvancedMode(true));
        }
        setShowDropdownMenu(false);
    };

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');
    const linkGenRepo: linkGenMethodsIF = useLinkGen('reposition');

    const repositionButton = (
        <Link
            className={styles.reposition_button}
            to={linkGenRepo.getFullURL({
                chain: chainId,
                tokenA:
                    tokenAAddress.toLowerCase() === position.quote.toLowerCase()
                        ? position.quote
                        : position.base,
                tokenB:
                    tokenBAddress.toLowerCase() === position.base.toLowerCase()
                        ? position.base
                        : position.quote,
                lowTick: position.bidTick.toString(),
                highTick: position.askTick.toString(),
            })}
            onClick={() => {
                setSimpleRangeWidth(10);
                setCurrentRangeInReposition(position.positionId);
                setCurrentRangeInAdd('');
            }}
            state={{ position: position }}
        >
            Reposition
        </Link>
    );

    const removeButton = positionMatchesLoggedInUser ? (
        <Chip onClick={() => openActionModal('Remove')}>Remove</Chip>
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
        !isAmbient && positionMatchesLoggedInUser ? (
            <Chip onClick={() => openActionModal('Harvest')}>Harvest</Chip>
        ) : null;

    // ----------------------

    const walletButton = (
        <Chip ariaLabel='View wallet.' onClick={props.handleAccountClick}>
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
            {!view1 && showRepositionButton && repositionButton}
            {!view1 &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {view3 && !isEmpty && removeButton}
            {view3 && !isEmpty && harvestButton}
            {!userMatchesConnectedAccount && !view1 && copyButton}
        </div>
    );

    const dropdownMenuContent = (
        <div className={styles.menu_column}>
            {view1 &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {!view3 && !isEmpty && harvestButton}
            {!view3 && !isEmpty && removeButton}
            {detailsButton}
            {!isAccountView && walletButton}
            {view1 && showRepositionButton && repositionButton}
            {!userMatchesConnectedAccount && view1 && copyButton}
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

    const [cachedPosition, setCachedPosition] = useState<
        PositionIF | undefined
    >();

    useEffect(() => {
        if (isRangeActionModalOpen || isRangeDetailsModalOpen) {
            if (
                !cachedPosition ||
                position.positionId === cachedPosition.positionId
            ) {
                setCachedPosition({ ...position } as PositionIF);
            }
        } else {
            setCachedPosition(undefined);
        }
    }, [isRangeActionModalOpen, isRangeDetailsModalOpen, position]);

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
            {isRangeDetailsModalOpen && cachedPosition && (
                <RangeDetailsModal
                    position={cachedPosition}
                    onClose={closeRangeDetailsModal}
                    {...rangeDetailsProps}
                />
            )}
            {isRangeActionModalOpen && cachedPosition && (
                <RangeActionModal
                    type={rangeModalAction}
                    isOpen={isRangeActionModalOpen}
                    onClose={handleActionModalClose}
                    position={cachedPosition}
                    {...rangeDetailsProps}
                />
            )}
        </FlexContainer>
    );
}
