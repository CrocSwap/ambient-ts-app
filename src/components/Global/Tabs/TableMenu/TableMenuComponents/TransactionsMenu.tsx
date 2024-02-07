// START: Import React and Dongles
import { useState, useRef, useContext, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components

// START: Import Local Files
import styles from './TableMenus.module.css';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { TransactionIF } from '../../../../../ambient-utils/types';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import {
    useLinkGen,
    linkGenMethodsIF,
    limitParamsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { Chip } from '../../../../Form/Chip';
import { FlexContainer } from '../../../../../styled/Common';
import { TradeDataContext } from '../../../../../contexts/TradeDataContext';

// interface for React functional component props
interface propsIF {
    tx: TransactionIF;
    isAccountView: boolean;
    handleWalletClick: () => void;
    openDetailsModal: () => void;
}

// React functional component
export default function TransactionsMenu(props: propsIF) {
    const { tx, isAccountView, openDetailsModal } = props;
    const {
        chainData: { blockExplorer, chainId },
    } = useContext(CrocEnvContext);
    const {
        setSimpleRangeWidth,
        setPrimaryQuantityRange,
        setRangeTicksCopied,
        setAdvancedHighTick,
        setAdvancedLowTick,
        setAdvancedMode,
    } = useContext(RangeContext);

    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation, setActiveMobileComponent } =
        useContext(TradeTableContext);

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
        disableReverseTokens,
        setShouldSwapDirectionReverse,
    } = useContext(TradeDataContext);
    const menuItemRef = useRef<HTMLDivElement>(null);

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleCopyClick = () => {
        if (disableReverseTokens) return;
        setActiveMobileComponent('trade');
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
            const shouldReverse =
                tokenA.address.toLowerCase() !== tx.base.toLowerCase();
            if (shouldReverse) {
                setPrimaryQuantityRange('');
            }
        } else if (tx.positionType === 'concentrated') {
            setTimeout(() => {
                setRangeTicksCopied(true);
                setAdvancedLowTick(tx.bidTick);
                setAdvancedHighTick(tx.askTick);
                setAdvancedMode(true);
                const shouldReverse =
                    tokenA.address.toLowerCase() !== tx.base.toLowerCase();
                if (shouldReverse) {
                    setPrimaryQuantityRange('');
                }
            }, 1000);
        } else if (tx.entityType === 'swap') {
            const shouldReverse =
                tokenA.address.toLowerCase() ===
                (tx.isBuy ? tx.quote.toLowerCase() : tx.base.toLowerCase());
            if (shouldReverse) {
                setIsTokenAPrimary(!isTokenAPrimary);
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

    const isTxCopiable = true;

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
        if (disableReverseTokens) return;
        switch (entityType) {
            case 'liqchange':
                linkGenPool.navigate({
                    chain: chainId,
                    tokenA: tx.isBid ? tx.base : tx.quote,
                    tokenB: tx.isBid ? tx.quote : tx.base,
                });
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

    const copyButton = (
        <Chip
            disabled={disableReverseTokens}
            onClick={() => copyButtonFunction(tx.entityType)}
        >
            {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
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
    const transactionsMenu = (
        <div className={styles.actions_menu}>{isTxCopiable && copyButton}</div>
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
