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
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
import {
    TradeDataIF,
    setIsTokenAPrimary,
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

    const tradeData: TradeDataIF = useAppSelector((state) => state.tradeData);

    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const dispatch = useAppDispatch();

    // -----------------SNACKBAR----------------

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
            <Chip
                id={`claim_limit_button_${limitOrder.limitOrderId}`}
                onClick={() => openLimitActionModal('Claim')}
            >
                Claim
            </Chip>
        ) : null;
    const copyButton = limitOrder ? (
        <Chip
            onClick={() => {
                const { base, quote, isBid, bidTick, askTick } = limitOrder;
                const newTokenA: string = isBid ? base : quote;
                const newTokenB: string = isBid ? quote : base;
                // determine if old token A === new token A
                // no => flip `isTokenAPrimary`
                tradeData.tokenA.address.toLowerCase() !==
                    newTokenA.toLowerCase() &&
                    dispatch(setIsTokenAPrimary(!tradeData.isTokenAPrimary));
                // URL params for link to limit page
                const limitLinkParams: limitParamsIF = {
                    chain: chainData.chainId,
                    tokenA: newTokenA,
                    tokenB: newTokenB,
                    limitTick: isBid ? bidTick : askTick,
                };
                // navigate user to limit page with URL params defined above
                linkGenLimit.navigate(limitLinkParams);
                setActiveMobileComponent('trade');
                handlePulseAnimation('limitOrder');
                setShowDropdownMenu(false);
            }}
        >
            {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
        </Chip>
    ) : null;
    const detailsButton = <Chip onClick={openLimitDetailsModal}>Details</Chip>;

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
                <div className={styles.actions_menu}>
                    {(view3 || view2WithNoSidebar) && detailsButton}
                    {minView && claimButton}
                    {minView && removeButton}
                    {minView && copyButton}
                </div>
                <div className={styles.dropdown_menu} ref={menuItemRef}>
                    <div
                        onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                        className={styles.dropdown_button}
                    >
                        <CiCircleMore size={25} color='var(--text1)' />
                    </div>
                    <div className={wrapperStyle}>{menuContent}</div>
                </div>
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
                    isAccountView={isAccountView}
                />
            )}
        </FlexContainer>
    );
}
