// START: Import React and Dongles
import { useState, useRef, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components
import RangeDetails from '../../../../RangeDetails/RangeDetails';

// START: Import Local Files
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
import { useModal } from '../../../Modal/useModal';
import Modal from '../../../Modal/Modal';
import { IS_LOCAL_ENV } from '../../../../../constants';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import RangeActionModal from '../../../../RangeActionModal/RangeActionModal';
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
        globalModal: { open: openGlobalModal, close: closeGlobalModal },
    } = useContext(AppStateContext);
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
        isRemoveRangeModalOpen,
        openRemoveRangeModal,
        closeRemoveRangeModal,
    ] = useModal();
    const [isHarvestModalOpen, openHarvestModal, closeHarvestModal] =
        useModal();

    const handleModalClose = () => {
        IS_LOCAL_ENV && console.debug('CLOSING THE MODAL!!!!');
        closeHarvestModal();
        closeRemoveRangeModal();
        setShowDropdownMenu(false);
    };

    const openDetailsModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(
            <RangeDetails
                position={position}
                closeGlobalModal={closeGlobalModal}
                {...rangeDetailsProps}
            />,
        );
    };

    const isUserLoggedIn = useAppSelector((state) => state.userData).isLoggedIn;
    const tradeData = useAppSelector((state) => state.tradeData);
    const rtkTokenA = tradeData.tokenA.address;
    const rtkTokenB = tradeData.tokenB.address;

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
                tokenA:
                    rtkTokenA.toLowerCase() === position.quote.toLowerCase()
                        ? position.quote
                        : position.base,
                tokenB:
                    rtkTokenB.toLowerCase() === position.base.toLowerCase()
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
        <OptionButton onClick={openRemoveRangeModal} content='Remove' />
    ) : null;

    const copyButton = position ? (
        <OptionButton
            onClick={() => {
                linkGenPool.navigate({
                    chain: chainId,
                    tokenA:
                        rtkTokenA.toLowerCase() === position.quote.toLowerCase()
                            ? position.quote
                            : position.base,
                    tokenB:
                        rtkTokenA.toLowerCase() === position.quote.toLowerCase()
                            ? position.base
                            : position.quote,
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
                    tokenA:
                        rtkTokenA.toLowerCase() === position.quote.toLowerCase()
                            ? position.quote
                            : position.base,
                    tokenB:
                        rtkTokenA.toLowerCase() === position.quote.toLowerCase()
                            ? position.base
                            : position.quote,
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
            <OptionButton onClick={openHarvestModal} content='Harvest' />
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
        <div
            className={styles.main_container}
            onClick={(event) => event.stopPropagation()}
        >
            {rangesMenu}
            {dropdownRangesMenu}
            {isHarvestModalOpen && (
                <Modal onClose={handleModalClose} title='Harvest Fees' noHeader>
                    <RangeActionModal
                        type='Harvest'
                        handleModalClose={handleModalClose}
                        position={position}
                        {...rangeDetailsProps}
                    />
                </Modal>
            )}
            {isRemoveRangeModalOpen && (
                <Modal
                    onClose={handleModalClose}
                    title='Remove Liquidity'
                    noHeader
                >
                    <RangeActionModal
                        type='Remove'
                        position={position}
                        handleModalClose={handleModalClose}
                        {...rangeDetailsProps}
                    />
                </Modal>
            )}
        </div>
    );
}
