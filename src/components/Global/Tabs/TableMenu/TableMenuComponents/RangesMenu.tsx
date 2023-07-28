// START: Import React and Dongles
import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
import styles from './TableMenus.module.css';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
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
} from '../../../../../utils/hooks/useLinkGen';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import RangeActionModal from '../../../../RangeActionModal/RangeActionModal';
import { useModal } from '../../../Modal/useModal';
import RangeDetailsModal from '../../../../RangeDetails/RangeDetailsModal/RangeDetailsModal';
import { OptionButton } from '../../../Button/OptionButton';

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
    const { handlePulseAnimation } = useContext(TradeTableContext);

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

    const isUserLoggedIn = useAppSelector((state) => state.userData).isLoggedIn;

    const positionMatchesLoggedInUser =
        userMatchesConnectedAccount && isUserLoggedIn;

    const handleCopyClick = () => {
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
                tokenA: position.base,
                tokenB: position.quote,
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
        <OptionButton
            onClick={() => openActionModal('Remove')}
            content='Remove'
        />
    ) : null;

    const copyButton = position ? (
        <OptionButton
            onClick={() => {
                linkGenPool.navigate({
                    chain: chainId,
                    tokenA: position.base,
                    tokenB: position.quote,
                    lowTick: position.bidTick.toString(),
                    highTick: position.askTick.toString(),
                });
                handleCopyClick();
            }}
            content='Copy Trade'
        />
    ) : null;

    const addButton = (
        <OptionButton
            onClick={() => {
                linkGenPool.navigate({
                    chain: chainId,
                    tokenA: position.base,
                    tokenB: position.quote,
                    lowTick: position.bidTick.toString(),
                    highTick: position.askTick.toString(),
                });
                handleCopyClick();
                setCurrentRangeInAdd(position.positionId);
            }}
            content='Add'
        />
    );

    const detailsButton = (
        <OptionButton onClick={openDetailsModal} content='Details' />
    );
    const harvestButton =
        !isAmbient && positionMatchesLoggedInUser ? (
            <OptionButton
                onClick={() => openActionModal('Harvest')}
                content='Harvest'
            />
        ) : null;

    // ----------------------

    const view1 = useMediaQuery('(min-width: 720px)');
    const view2 = sidebar.isOpen
        ? useMediaQuery('(min-width: 1750px)')
        : useMediaQuery('(min-width: 1550px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    const showRepositionButton =
        !isPositionInRange &&
        !isPositionEmpty &&
        userMatchesConnectedAccount &&
        view1;
    // ----------------------

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {showRepositionButton && repositionButton}
            {view1 &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {view2 && !isEmpty && removeButton}
            {view3 && !isEmpty && harvestButton}
            {!userMatchesConnectedAccount && copyButton}
        </div>
    );

    const walletButton = (
        <OptionButton
            ariaLabel='View wallet.'
            onClick={props.handleAccountClick}
            content={
                <>
                    Wallet
                    <FiExternalLink
                        size={15}
                        color='white'
                        style={{ marginLeft: '.5rem' }}
                    />
                </>
            }
        />
    );

    null;

    const menuContent = (
        <div className={styles.menu_column}>
            {!view3 && !isEmpty && harvestButton}
            {!view2 && !isEmpty && removeButton}
            {detailsButton}
            {userMatchesConnectedAccount && copyButton}
            {walletButton}
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
            <div className={wrapperStyle}>{menuContent}</div>
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
        <div onClick={(event) => event.stopPropagation()}>
            <div className={styles.main_container}>
                {rangesMenu}
                {dropdownRangesMenu}
            </div>
            <RangeDetailsModal
                position={position}
                isOpen={isRangeDetailsModalOpen}
                onClose={closeRangeDetailsModal}
                {...rangeDetailsProps}
            />
            <RangeActionModal
                type={rangeModalAction}
                isOpen={isRangeActionModalOpen}
                onClose={handleActionModalClose}
                position={position}
                {...rangeDetailsProps}
            />
        </div>
    );
}
