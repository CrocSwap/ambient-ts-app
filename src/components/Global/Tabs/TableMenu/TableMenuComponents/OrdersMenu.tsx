import { useContext, useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { FiExternalLink } from 'react-icons/fi';

import {
    LimitModalAction,
    LimitOrderIF,
} from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { FlexContainer } from '../../../../../styled/Common';
import {
    limitParamsIF,
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../../utils/hooks/useLinkGen';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { Chip } from '../../../../Form/Chip';
import styles from './TableMenus.module.css';

// interface for React functional component props
interface propsIF {
    limitOrder: LimitOrderIF;
    isOwnerActiveAccount?: boolean;
    isOrderFilled: boolean;
    isAccountView: boolean;
    handleWalletLinkClick: () => void;
    openDetailsModal: () => void;
    openActionModal: () => void;
    setLimitModalAction: React.Dispatch<React.SetStateAction<LimitModalAction>>;
    tableView: 'small' | 'medium' | 'large';
}

export type LimitActionType = 'Remove' | 'Claim';

// React functional component
export default function OrdersMenu(props: propsIF) {
    const {
        limitOrder,
        isOrderFilled,
        isOwnerActiveAccount,
        isAccountView,
        handleWalletLinkClick,
        openDetailsModal,
        openActionModal,
        setLimitModalAction,
        tableView,
    } = props;

    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);

    const { tokenA, isTokenAPrimary, setIsTokenAPrimary } =
        useContext(TradeDataContext);
    // hook to generate navigation actions with pre-loaded path
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');

    // -----------------SNACKBAR----------------

    // -----------------END OF SNACKBAR----------------

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
            ? useMediaQuery('(max-width: 1600px)')
            : useMediaQuery('(max-width: 1450px)')
        : isSidebarOpen
          ? useMediaQuery('(max-width: 2000px)')
          : useMediaQuery('(max-width: 1250px)');

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    const smallView = tableView === 'small';

    const walletButton = (
        <Chip ariaLabel='View wallet.' onClick={handleWalletLinkClick}>
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
                tokenA.address.toLowerCase() !== newTokenA.toLowerCase() &&
                    setIsTokenAPrimary(!isTokenAPrimary);
                // URL params for link to limit page
                const limitLinkParams: limitParamsIF = {
                    chain: chainId,
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
            {smallView && claimButton}
            {smallView && copyButton}
            {smallView && removeButton}
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
                    {!smallView && claimButton}
                    {!smallView && removeButton}
                    {!smallView && copyButton}
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
        </FlexContainer>
    );
}
