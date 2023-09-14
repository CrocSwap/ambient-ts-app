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
import { FlexContainer } from '../../../../../styled/Common';

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
    const tradeData = useAppSelector((state) => state.tradeData);
    const rtkTokenA = tradeData.tokenA.address;
    const rtkTokenB = tradeData.tokenB.address;

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
            content={showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
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
            <OptionButton
                onClick={() => openActionModal('Harvest')}
                content='Harvest'
            />
        ) : null;

    // ----------------------

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

    const showCopyButtonOutsideDropdownMenu =
        useMediaQuery('(min-width: 400px)');

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {!view1 && showRepositionButton && repositionButton}
            {!view1 &&
                !showRepositionButton &&
                userMatchesConnectedAccount &&
                addButton}
            {view3 && !isEmpty && removeButton}
            {view3 && !isEmpty && harvestButton}
            {!userMatchesConnectedAccount &&
                showCopyButtonOutsideDropdownMenu &&
                copyButton}
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
            {isRangeDetailsModalOpen && (
                <RangeDetailsModal
                    position={position}
                    onClose={closeRangeDetailsModal}
                    {...rangeDetailsProps}
                />
            )}
            {isRangeActionModalOpen && (
                <RangeActionModal
                    type={rangeModalAction}
                    isOpen={isRangeActionModalOpen}
                    onClose={handleActionModalClose}
                    position={position}
                    {...rangeDetailsProps}
                />
            )}
        </FlexContainer>
    );
}
