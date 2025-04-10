import { useContext, useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { FiExternalLink } from 'react-icons/fi';

import { TransactionIF } from '../../../../../ambient-utils/types';
import { AppStateContext } from '../../../../../contexts';
import { RangeContext } from '../../../../../contexts/RangeContext';
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
    tx: TransactionIF;
    isAccountView: boolean;
    handleWalletClick: () => void;
    openDetailsModal: () => void;
    isOwnerActiveAccount: boolean;
    positionHash: string;
}

// React functional component
export default function TransactionsMenu(props: propsIF) {
    const {
        tx,
        isAccountView,
        openDetailsModal,
        isOwnerActiveAccount,
        positionHash,
    } = props;
    const {
        activeNetwork: { blockExplorer, chainId },
    } = useContext(AppStateContext);
    const {
        setSimpleRangeWidth,
        setRangeTicksCopied,
        setAdvancedHighTick,
        setAdvancedLowTick,
        setAdvancedMode,
    } = useContext(RangeContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const {
        handlePulseAnimation,
        setActiveMobileComponent,
        setOutsideControl,
        setSelectedOutsideTab,
        setShowAllData,
        setCurrentLimitOrderActive,
        setCurrentPositionActive,
    } = useContext(TradeTableContext);

    const showAbbreviatedCopyTradeButton = isAccountView
        ? isSidebarOpen
            ? useMediaQuery('(max-width: 1700px)')
            : useMediaQuery('(max-width: 1400px)')
        : isSidebarOpen
          ? useMediaQuery('(max-width: 1500px)')
          : useMediaQuery('(max-width: 1250px)');

    const {
        tokenA,
        isTokenAPrimary,
        setIsTokenAPrimary,
        setShouldSwapDirectionReverse,
        setActiveTab,
    } = useContext(TradeDataContext);
    const menuItemRef = useRef<HTMLDivElement>(null);

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleCopyClick = () => {
        setActiveMobileComponent('trade');
        setActiveTab('Order');
        if (tx.entityType === 'swap') {
            handlePulseAnimation('swap');
        } else if (tx.entityType === 'limitOrder') {
            handlePulseAnimation('limitOrder');
        } else if (tx.entityType === 'liqchange') {
            handlePulseAnimation('range');
        }

        if (tx.positionType === 'ambient') {
            setRangeTicksCopied(true);
            setSimpleRangeWidth(100);
            setAdvancedMode(false);
        } else if (tx.positionType === 'concentrated') {
            setTimeout(() => {
                setRangeTicksCopied(true);
                setAdvancedLowTick(tx.bidTick);
                setAdvancedHighTick(tx.askTick);
                setAdvancedMode(true);
            }, 1000);
        } else if (tx.entityType === 'swap') {
            const shouldReverse =
                tokenA.address.toLowerCase() ===
                (tx.isBuy ? tx.quote.toLowerCase() : tx.base.toLowerCase());
            if (shouldReverse) {
                setShouldSwapDirectionReverse(true);
            }
        } else if (tx.entityType === 'limitOrder') {
            tokenA.address.toLowerCase() !==
                (tx.isBuy ? tx.base.toLowerCase() : tx.quote.toLowerCase()) &&
                setIsTokenAPrimary(!isTokenAPrimary);
            // URL params for link to limit page
            const limitLinkParams: limitParamsIF = {
                chain: chainId,
                tokenA: tx.isBuy ? tx.base : tx.quote,
                tokenB: tx.isBuy ? tx.quote : tx.base,
                limitTick: tx.isBuy ? tx.bidTick : tx.askTick,
            };
            // navigate user to limit page with URL params defined above
            linkGenLimit.navigate(limitLinkParams);
        }
        setShowDropdownMenu(false);
    };

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.txHash}`;
            window.open(explorerUrl);
        }
    }

    const walletButton = (
        <Chip ariaLabel='View wallet.' onClick={props.handleWalletClick}>
            Wallet
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </Chip>
    );

    const copyButtonFunction = (entityType: string) => {
        switch (entityType) {
            case 'liqchange':
                if (tokenA.address.toLowerCase() === tx.base.toLowerCase()) {
                    linkGenPool.navigate({
                        chain: chainId,
                        tokenA: tx.base,
                        tokenB: tx.quote,
                    });
                } else {
                    linkGenPool.navigate({
                        chain: chainId,
                        tokenA: tx.quote,
                        tokenB: tx.base,
                    });
                }
                break;
            case 'limitOrder':
                linkGenLimit.navigate(
                    tx.isBid
                        ? {
                              chain: chainId,
                              tokenA: tx.base,
                              tokenB: tx.quote,
                              limitTick: tx.bidTick,
                          }
                        : {
                              chain: chainId,
                              tokenA: tx.quote,
                              tokenB: tx.base,
                              limitTick: tx.askTick,
                          },
                );

                break;
            default:
                linkGenMarket.navigate(
                    tx.isBuy
                        ? {
                              chain: chainId,
                              tokenA: tx.base,
                              tokenB: tx.quote,
                          }
                        : {
                              chain: chainId,
                              tokenA: tx.quote,
                              tokenB: tx.base,
                          },
                );
                break;
        }
        handleCopyClick();
    };

    const viewButtonFunction = (entityType: string) => {
        switch (entityType) {
            case 'limitOrder':
                setOutsideControl(true);
                setSelectedOutsideTab(1);
                setShowAllData(false);
                setCurrentLimitOrderActive(positionHash);
                break;
            case 'liqchange':
                setOutsideControl(true);
                setSelectedOutsideTab(2);
                setShowAllData(false);
                setCurrentPositionActive(positionHash);
                break;
            default:
                setOutsideControl(true);
                setSelectedOutsideTab(0);
                setShowAllData(false);
                break;
        }
    };

    const copyButton = (
        <Chip onClick={() => copyButtonFunction(tx.entityType)}>
            {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
        </Chip>
    );

    const viewButton = (
        <Chip onClick={() => viewButtonFunction(tx.entityType)}>
            {showAbbreviatedCopyTradeButton ? 'View' : 'View Status'}
        </Chip>
    );

    const explorerButton = (
        <Chip onClick={handleOpenExplorer} ariaLabel='Open explorer.'>
            Explorer
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </Chip>
    );
    const detailsButton = (
        <Chip onClick={openDetailsModal} ariaLabel='Open details modal.'>
            Details
        </Chip>
    );

    const showCopyButtonOutsideDropdownMenu =
        useMediaQuery('(min-width: 650px)');
    // --------------------------------

    const showViewButton =
        isOwnerActiveAccount &&
        ['limitOrder', 'liqchange'].includes(tx.entityType) &&
        !['remove', 'recover', 'burn'].includes(tx.changeType);

    const showExplorerButton = isOwnerActiveAccount && !showViewButton;

    const transactionsMenu = (
        <div className={styles.actions_menu}>
            {showExplorerButton
                ? explorerButton
                : showViewButton
                  ? viewButton
                  : copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {explorerButton}
            {!showCopyButtonOutsideDropdownMenu && copyButton}
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

    useEffect(() => {
        if (
            showDropdownMenu &&
            document.activeElement !== menuItemRef.current
        ) {
            const interval = setTimeout(() => {
                setShowDropdownMenu(false);
            }, 5000);
            return () => clearTimeout(interval);
        } else return;
    }, [showDropdownMenu]);

    UseOnClickOutside(menuItemRef, clickOutsideHandler);

    const dropdownTransactionsMenu = (
        <div className={styles.dropdown_menu} ref={menuItemRef}>
            <button
                onClick={() => setShowDropdownMenu(!showDropdownMenu)}
                className={styles.dropdown_button}
            >
                <CiCircleMore size={25} color='var(--text1)' />
            </button>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );

    return (
        <FlexContainer justifyContent='flex-end'>
            <div
                onClick={(event) => event.stopPropagation()}
                style={{ width: 'min-content', cursor: 'default' }}
                className={styles.main_container}
            >
                {showCopyButtonOutsideDropdownMenu && transactionsMenu}
                {dropdownTransactionsMenu}
            </div>
        </FlexContainer>
    );
}
