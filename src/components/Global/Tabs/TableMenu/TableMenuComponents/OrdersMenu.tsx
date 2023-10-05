// START: Import React and Dongles
import { useState, useRef, useEffect, useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components

// START: Import Local Files
import styles from './TableMenus.module.css';
import OrderDetailsModal from '../../../../OrderDetails/OrderDetailsModal/OrderDetailsModal';
import LimitActionModal from '../../../../LimitActionModal/LimitActionModal';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setLimitTick,
    setLimitTickCopied,
} from '../../../../../utils/state/tradeDataSlice';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    limitParamsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useModal } from '../../../Modal/useModal';
import { Chip } from '../../../../Form/Chip';
import { FlexContainer } from '../../../../../styled/Common';

// interface for React functional component props
interface propsIF {
    limitOrder: LimitOrderIF;
    isOwnerActiveAccount?: boolean;
    isOrderFilled: boolean;
    isAccountView: boolean;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    handleAccountClick: () => void;
}

export type LimitActionType = 'Remove' | 'Claim';

// React functional component
export default function OrdersMenu(props: propsIF) {
    const {
        limitOrder,
        isOrderFilled,
        isOwnerActiveAccount,
        isBaseTokenMoneynessGreaterOrEqual,
        isAccountView,
        handleAccountClick,
    } = props;

    const menuItemRef = useRef<HTMLDivElement>(null);

    const { chainData } = useContext(CrocEnvContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);

    // const tradeData = useAppSelector((state) => state.tradeData);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    const dispatch = useAppDispatch();

    // -----------------SNACKBAR----------------
    function handleCopyOrder() {
        setActiveMobileComponent('trade');

        handlePulseAnimation('limitOrder');
        dispatch(setLimitTickCopied(true));

        // why is this is in on a half-second delay?
        setTimeout(() => {
            dispatch(
                setLimitTick(
                    limitOrder.isBid ? limitOrder.bidTick : limitOrder.askTick,
                ),
            );
        }, 500);

        setShowDropdownMenu(false);
    }

    // -----------------END OF SNACKBAR----------------

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    const [isActionModalOpen, openActionModal, closeActionModal] = useModal();
    const [limitModalAction, setLimitModalAction] =
        useState<LimitActionType>('Remove');

    const openLimitDetailsModal = () => {
        setShowDropdownMenu(false);
        openDetailsModal();
    };

    const openLimitActionModal = (type: LimitActionType) => {
        setShowDropdownMenu(false);
        setLimitModalAction(type);
        openActionModal();
    };

    const showAbbreviatedCopyTradeButton = isAccountView
        ? isSidebarOpen
            ? useMediaQuery('(max-width: 1400px)')
            : useMediaQuery('(max-width: 1150px)')
        : isSidebarOpen
        ? useMediaQuery('(max-width: 1500px)')
        : useMediaQuery('(max-width: 1250px)');

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const minView = useMediaQuery('(min-width: 720px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    const view2WithNoSidebar =
        useMediaQuery('(min-width: 1680px)') && !isSidebarOpen;

    const walletButton = (
        <Chip ariaLabel='View wallet.' onClick={handleAccountClick}>
            Wallet
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </Chip>
    );
    const removeButton =
        limitOrder && isOwnerActiveAccount && !isOrderFilled ? (
            <Chip onClick={() => openLimitActionModal('Remove')}>Remove</Chip>
        ) : null;
    const claimButton =
        limitOrder && isOwnerActiveAccount && isOrderFilled ? (
            <Chip onClick={() => openLimitActionModal('Claim')}>Claim</Chip>
        ) : null;
    const copyButton = limitOrder ? (
        <Chip
            onClick={() => {
                dispatch(setLimitTickCopied(true));
                const { base, quote, isBid, bidTick, askTick } = limitOrder;
                // URL params for link to limit page
                const limitLinkParams: limitParamsIF = {
                    chain: chainData.chainId,
                    tokenA: isBid ? base : quote,
                    tokenB: isBid ? quote : base,
                    limitTick: isBid ? bidTick : askTick,
                };
                // navigate user to limit page with URL params defined above
                linkGenLimit.navigate(limitLinkParams);
                handleCopyOrder();
            }}
        >
            {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
        </Chip>
    ) : null;
    const detailsButton = <Chip onClick={openLimitDetailsModal}>Details</Chip>;

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {(view3 || view2WithNoSidebar) && detailsButton}
            {minView && claimButton}
            {minView && removeButton}
            {minView && copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {!minView && copyButton}
            {!minView && removeButton}
            {!isAccountView && walletButton}
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
    const dropdownOrdersMenu = (
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
        <FlexContainer justifyContent='flex-end'>
            <div
                onClick={(event) => event.stopPropagation()}
                style={{ width: 'min-content', cursor: 'default' }}
                className={styles.main_container}
            >
                {ordersMenu}
                {dropdownOrdersMenu}
            </div>
            {isDetailsModalOpen && (
                <OrderDetailsModal
                    limitOrder={limitOrder}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isAccountView={isAccountView}
                    onClose={closeDetailsModal}
                />
            )}
            {isActionModalOpen && (
                <LimitActionModal
                    limitOrder={limitOrder}
                    type={limitModalAction}
                    isOpen={isActionModalOpen}
                    onClose={closeActionModal}
                />
            )}
        </FlexContainer>
    );
}
