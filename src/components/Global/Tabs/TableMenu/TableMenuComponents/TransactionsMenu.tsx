// START: Import React and Dongles
import { useState, useRef, useContext } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components

// START: Import Local Files
import styles from './TableMenus.module.css';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import TransactionDetails from '../../../TransactionDetails/TransactionDetails';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setIsTokenAPrimary,
    setLimitTick,
    setLimitTickCopied,
    setShouldSwapDirectionReverse,
    setShouldLimitDirectionReverse,
    setShouldRangeDirectionReverse,
    setPrimaryQuantityRange,
    setRangeTicksCopied,
} from '../../../../../utils/state/tradeDataSlice';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';

// interface for React functional component props
interface propsIF {
    tx: TransactionIF;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isAccountView: boolean;
    handleWalletClick: () => void;
}

// React functional component
export default function TransactionsMenu(props: propsIF) {
    const { isBaseTokenMoneynessGreaterOrEqual, tx, isAccountView } = props;
    const {
        globalModal: { open: openGlobalModal },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer, chainId },
    } = useContext(CrocEnvContext);
    const { setSimpleRangeWidth } = useContext(RangeContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation } = useContext(TradeTableContext);

    const showAbbreviatedCopyTradeButton = isAccountView
        ? isSidebarOpen
            ? useMediaQuery('(max-width: 1400px)')
            : useMediaQuery('(max-width: 1150px)')
        : isSidebarOpen
        ? useMediaQuery('(max-width: 1500px)')
        : useMediaQuery('(max-width: 1250px)');

    const tradeData = useAppSelector((state) => state.tradeData);

    const menuItemRef = useRef<HTMLDivElement>(null);

    const dispatch = useAppDispatch();

    // hooks to generate navigation actions with pre-loaded paths
    const linkGenMarket: linkGenMethodsIF = useLinkGen('market');
    const linkGenLimit: linkGenMethodsIF = useLinkGen('limit');
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    const handleCopyClick = () => {
        if (tx.entityType === 'swap') {
            handlePulseAnimation('swap');
        } else if (tx.entityType === 'limitOrder') {
            handlePulseAnimation('limitOrder');
        } else if (tx.entityType === 'liqchange') {
            handlePulseAnimation('range');
        }

        if (tx.positionType === 'ambient') {
            dispatch(setRangeTicksCopied(true));
            setSimpleRangeWidth(100);
            dispatch(setAdvancedMode(false));
            const shouldReverse =
                tradeData.tokenA.address.toLowerCase() !==
                tx.base.toLowerCase();
            if (shouldReverse) {
                dispatch(setPrimaryQuantityRange(''));
                dispatch(setShouldRangeDirectionReverse(true));
            }
        } else if (tx.positionType === 'concentrated') {
            setTimeout(() => {
                dispatch(setRangeTicksCopied(true));
                dispatch(setAdvancedLowTick(tx.bidTick));
                dispatch(setAdvancedHighTick(tx.askTick));
                dispatch(setAdvancedMode(true));
                const shouldReverse =
                    tradeData.tokenA.address.toLowerCase() !==
                    tx.base.toLowerCase();
                if (shouldReverse) {
                    dispatch(setPrimaryQuantityRange(''));
                    dispatch(setShouldRangeDirectionReverse(true));
                }
            }, 1000);
        } else if (tx.entityType === 'swap') {
            dispatch(
                setIsTokenAPrimary(
                    (tx.isBuy && tx.inBaseQty) || (!tx.isBuy && !tx.inBaseQty),
                ),
            );
            const shouldReverse =
                tradeData.tokenA.address.toLowerCase() ===
                (tx.isBuy ? tx.quote.toLowerCase() : tx.base.toLowerCase());
            if (shouldReverse) {
                dispatch(setShouldSwapDirectionReverse(true));
            }
        } else if (tx.entityType === 'limitOrder') {
            dispatch(setLimitTickCopied(true));
            linkGenLimit.navigate(
                tx.isBuy
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
            const shouldReverse =
                tradeData.tokenA.address.toLowerCase() ===
                (tx.isBuy ? tx.quote.toLowerCase() : tx.base.toLowerCase());
            if (shouldReverse) {
                dispatch(setShouldLimitDirectionReverse(true));
            }
            setTimeout(() => {
                dispatch(setLimitTick(tx.isBuy ? tx.bidTick : tx.askTick));
            }, 500);
        }
        setShowDropdownMenu(false);
    };

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.txHash}`;
            window.open(explorerUrl);
        }
    }

    const openDetailsModal = () => {
        openGlobalModal(
            <TransactionDetails
                tx={tx}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isAccountView={isAccountView}
            />,
        );
    };

    const isTxCopiable = true;

    const walletButton = (
        <button
            className={styles.option_button}
            tabIndex={0}
            aria-label='View wallet.'
            onClick={props.handleWalletClick}
        >
            Wallet
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </button>
    );

    const copyButton =
        tx.entityType === 'liqchange' ? (
            <button
                className={styles.option_button}
                onClick={() => {
                    linkGenPool.navigate({
                        chain: chainId,
                        tokenA: tx.isBid ? tx.base : tx.quote,
                        tokenB: tx.isBid ? tx.quote : tx.base,
                        lowTick: tx.bidTick.toString(),
                        highTick: tx.askTick.toString(),
                    });
                    handleCopyClick();
                }}
                tabIndex={0}
                aria-label='Copy trade.'
            >
                {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            </button>
        ) : tx.entityType === 'limitOrder' ? (
            <button
                className={styles.option_button}
                onClick={() => {
                    dispatch(setLimitTickCopied(true));
                    dispatch(setLimitTick(undefined));
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
                    handleCopyClick();
                }}
                tabIndex={0}
                aria-label='Copy trade.'
            >
                {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            </button>
        ) : (
            <button
                className={styles.option_button}
                onClick={() => {
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
                    handleCopyClick();
                }}
                tabIndex={0}
                aria-label='Copy trade.'
            >
                {showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            </button>
        );

    const explorerButton = (
        <button
            className={styles.option_button}
            onClick={handleOpenExplorer}
            tabIndex={0}
            aria-label='Open explorer.'
        >
            Explorer
            <FiExternalLink
                size={15}
                color='white'
                style={{ marginLeft: '.5rem' }}
            />
        </button>
    );
    const detailsButton = (
        <button
            className={styles.option_button}
            onClick={() => openDetailsModal()}
            tabIndex={0}
            aria-label='Open details modal.'
        >
            Details
        </button>
    );

    // eslint-disable-next-line
    const view1NoSidebar =
        useMediaQuery('(min-width: 1280px)') && !isSidebarOpen;
    const desktopView = useMediaQuery('(min-width: 768px)');

    // --------------------------------
    const transactionsMenu = (
        <div className={styles.actions_menu}>{isTxCopiable && copyButton}</div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {explorerButton}
            {!desktopView && copyButton}
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

    // useEffect(() => {
    //     if (
    //         showDropdownMenu &&
    //         document.activeElement !== menuItemRef.current
    //     ) {
    //         const interval = setTimeout(() => {
    //             setShowDropdownMenu(false);
    //         }, 5000);
    //         return () => clearTimeout(interval);
    //     } else return;
    // }, [showDropdownMenu]);

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
        <div
            className={styles.main_container}
            onClick={(event) => event.stopPropagation()}
        >
            {desktopView && transactionsMenu}
            {dropdownTransactionsMenu}
        </div>
    );
}
