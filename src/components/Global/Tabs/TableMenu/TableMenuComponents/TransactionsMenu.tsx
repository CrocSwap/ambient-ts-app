// START: Import React and Dongles
import { useState, useRef, useContext, useEffect } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { CiCircleMore } from 'react-icons/ci';
// START: Import JSX Functional Components

// START: Import Local Files
import styles from './TableMenus.module.css';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import TransactionDetailsModal from '../../../TransactionDetails/TransactionDetailsModal';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setLimitTick,
    setLimitTickCopied,
    setShouldSwapDirectionReverse,
    setShouldLimitDirectionReverse,
    setShouldRangeDirectionReverse,
    setPrimaryQuantityRange,
    setRangeTicksCopied,
} from '../../../../../utils/state/tradeDataSlice';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { SidebarContext } from '../../../../../contexts/SidebarContext';
import { RangeContext } from '../../../../../contexts/RangeContext';
import {
    useLinkGen,
    linkGenMethodsIF,
} from '../../../../../utils/hooks/useLinkGen';
import { TradeTableContext } from '../../../../../contexts/TradeTableContext';
import { useModal } from '../../../Modal/useModal';
import { OptionButton } from '../../../Button/OptionButton';

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
        chainData: { blockExplorer, chainId },
    } = useContext(CrocEnvContext);
    const { setSimpleRangeWidth } = useContext(RangeContext);
    const {
        sidebar: { isOpen: isSidebarOpen },
    } = useContext(SidebarContext);
    const { handlePulseAnimation } = useContext(TradeTableContext);

    const [isDetailsModalOpen, openDetailsModal, closeDetailsModal] =
        useModal();

    const showAbbreviatedCopyTradeButton = isAccountView
        ? isSidebarOpen
            ? useMediaQuery('(max-width: 1700px)')
            : useMediaQuery('(max-width: 1400px)')
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

    const isTxCopiable = true;

    const walletButton = (
        <OptionButton
            ariaLabel='View wallet.'
            onClick={props.handleWalletClick}
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

    const copyButton =
        tx.entityType === 'liqchange' ? (
            <OptionButton
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
                ariaLabel='Copy trade.'
                content={showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            />
        ) : tx.entityType === 'limitOrder' ? (
            <OptionButton
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
                ariaLabel='Copy trade.'
                content={showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            />
        ) : (
            <OptionButton
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
                ariaLabel='Copy trade.'
                content={showAbbreviatedCopyTradeButton ? 'Copy' : 'Copy Trade'}
            />
        );

    const explorerButton = (
        <OptionButton
            onClick={handleOpenExplorer}
            ariaLabel='Open explorer.'
            content={
                <>
                    Explorer
                    <FiExternalLink
                        size={15}
                        color='white'
                        style={{ marginLeft: '.5rem' }}
                    />
                </>
            }
        />
    );
    const detailsButton = (
        <OptionButton
            onClick={openDetailsModal}
            ariaLabel='Open details modal.'
            content='Details'
        />
    );

    const showCopyButtonOutsideDropdownMenu =
        useMediaQuery('(min-width: 400px)');
    // eslint-disable-next-line
    const view1NoSidebar =
        useMediaQuery('(min-width: 1280px)') && !isSidebarOpen;

    // --------------------------------
    const transactionsMenu = (
        <div className={styles.actions_menu}>{isTxCopiable && copyButton}</div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {detailsButton}
            {explorerButton}
            {!showCopyButtonOutsideDropdownMenu && copyButton}
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

    const handleCloseModal = () => {
        clickOutsideHandler();
        closeDetailsModal();
    };

    return (
        <div onClick={(event) => event.stopPropagation()}>
            <div className={styles.main_container}>
                {showCopyButtonOutsideDropdownMenu && transactionsMenu}
                {dropdownTransactionsMenu}
            </div>
            {isDetailsModalOpen && (
                <TransactionDetailsModal
                    tx={tx}
                    isBaseTokenMoneynessGreaterOrEqual={
                        isBaseTokenMoneynessGreaterOrEqual
                    }
                    isAccountView={isAccountView}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
