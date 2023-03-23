// START: Import React and Dongles
import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
// import { Link } from 'react-router-dom';
import { FiExternalLink, FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
// import Modal from '../../../../Global/Modal/Modal';
// import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

// START: Import Local Files
import styles from './TableMenus.module.css';
// import { useModal } from '../../../../Global/Modal/useModal';
// import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import TransactionDetails from '../../../TransactionDetails/TransactionDetails';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setIsTokenAPrimary,
    setLimitTick,
    setLimitTickCopied,
    // setPrimaryQuantity,
    setShouldLimitConverterUpdate,
    tradeData,
} from '../../../../../utils/state/tradeDataSlice';
import { useNavigate } from 'react-router-dom';
import { TransactionIF } from '../../../../../utils/interfaces/exports';

// interface for React functional component props
interface propsIF {
    account: string;
    tradeData: tradeData;
    userPosition: boolean | undefined; // position belongs to active user
    isTokenABase: boolean;
    tx: TransactionIF;
    blockExplorer?: string;
    showSidebar: boolean;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    handlePulseAnimation?: (type: string) => void;
    isBaseTokenMoneynessGreaterOrEqual: boolean;
    isOnPortfolioPage: boolean;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

// React functional component
export default function TransactionsMenu(props: propsIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);
    const {
        account,
        tradeData,
        // isTokenABase,
        // userPosition,
        isBaseTokenMoneynessGreaterOrEqual,
        tx,
        blockExplorer,
        showSidebar,
        openGlobalModal,
        closeGlobalModal,
        handlePulseAnimation,
        isOnPortfolioPage,
        setSimpleRangeWidth,
    } = props;

    // const [value, copy] = useCopyToClipboard();
    // const [openSnackbar, setOpenSnackbar] = useState(false);
    // const [isModalOpen, openModal, closeModal] = useModal();
    // const [currentModal, setCurrentModal] = useState('edit');
    // ---------------------MODAL FUNCTIONALITY----------------
    // let modalContent: ReactNode;

    // let modalTitle;

    // function openRemoveModal() {
    //     setCurrentModal('remove');
    //     openModal();
    // }

    // function openDetailsModal() {
    //     setCurrentModal('details');
    //     openModal();
    // }
    // function openHarvestModal() {
    //     setCurrentModal('harvest');
    //     openModal();
    // }

    // -----------------SNACKBAR----------------
    // function handleCopyAddress() {
    //     copy('Not Yet Implemented');

    //     setOpenSnackbar(true);
    // }
    const dispatch = useAppDispatch();

    const handleCopyClick = () => {
        // console.log('copy clicked');
        if (handlePulseAnimation) {
            if (tx.entityType === 'swap') {
                handlePulseAnimation('swap');
            } else if (tx.entityType === 'limitOrder') {
                handlePulseAnimation('limitOrder');
            } else if (tx.entityType === 'liqchange') {
                handlePulseAnimation('range');
            }
        }

        if (tx.positionType === 'ambient') {
            setSimpleRangeWidth(100);
            dispatch(setAdvancedMode(false));
        } else if (tx.positionType === 'concentrated') {
            setTimeout(() => {
                dispatch(setAdvancedLowTick(tx.bidTick));
                dispatch(setAdvancedHighTick(tx.askTick));
                dispatch(setAdvancedMode(true));
            }, 1000);
        } else if (tx.entityType === 'swap') {
            dispatch(
                setIsTokenAPrimary(
                    (tx.isBuy && tx.inBaseQty) || (!tx.isBuy && !tx.inBaseQty),
                ),
            );
        } else if (tx.entityType === 'limitOrder') {
            dispatch(setLimitTickCopied(true));
            // console.log('limit order copy clicked');
            console.log({ tradeData });
            console.log({ tx });
            const shouldMovePrimaryQuantity =
                tradeData.tokenA.address.toLowerCase() ===
                (tx.isBid ? tx.quote.toLowerCase() : tx.base.toLowerCase());

            console.log({ shouldMovePrimaryQuantity });
            const shouldClearNonPrimaryQty =
                tradeData.limitTick !== tx.askTick &&
                (tradeData.isTokenAPrimary
                    ? tradeData.tokenA.address.toLowerCase() ===
                      (tx.isBid
                          ? tx.base.toLowerCase()
                          : tx.quote.toLowerCase())
                        ? true
                        : false
                    : tradeData.tokenB.address.toLowerCase() ===
                      (tx.isBid
                          ? tx.quote.toLowerCase()
                          : tx.base.toLowerCase())
                    ? true
                    : false);
            if (shouldMovePrimaryQuantity) {
                console.log('flipping primary');
                // setTimeout(() => {
                const sellQtyField = document.getElementById(
                    'sell-limit-quantity',
                ) as HTMLInputElement;
                const buyQtyField = document.getElementById(
                    'buy-limit-quantity',
                ) as HTMLInputElement;

                if (tradeData.isTokenAPrimary) {
                    if (buyQtyField) {
                        buyQtyField.value = sellQtyField.value;
                    }
                    if (sellQtyField) {
                        sellQtyField.value = '';
                        // tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                    }
                } else {
                    if (sellQtyField) {
                        sellQtyField.value = buyQtyField.value;
                        // tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                    }
                    if (buyQtyField) {
                        buyQtyField.value = '';
                    }
                }
                // }, 500);
                dispatch(setIsTokenAPrimary(!tradeData.isTokenAPrimary));
                dispatch(setShouldLimitConverterUpdate(true));
            } else if (shouldClearNonPrimaryQty) {
                if (!tradeData.isTokenAPrimary) {
                    const sellQtyField = document.getElementById(
                        'sell-limit-quantity',
                    ) as HTMLInputElement;
                    if (sellQtyField) {
                        sellQtyField.value = '';
                        // tradeData.primaryQuantity === 'NaN' ? '' : tradeData.primaryQuantity;
                    }
                } else {
                    const buyQtyField = document.getElementById(
                        'buy-limit-quantity',
                    ) as HTMLInputElement;
                    if (buyQtyField) {
                        buyQtyField.value = '';
                    }
                }
                console.log('resetting');
                // dispatch(setPrimaryQuantity(''));
            }
            setTimeout(() => {
                dispatch(setLimitTick(tx.isBid ? tx.bidTick : tx.askTick));
            }, 500);

            // dispatch(
            //     setIsTokenAPrimary((tx.isBid && tx.inBaseQty) || (!tx.isBid && !tx.inBaseQty)),
            // );
        }
        setShowDropdownMenu(false);

        // dispatch(setRangeModuleTriggered(true));
    };

    function handleOpenExplorer() {
        if (tx && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${tx.tx}`;
            window.open(explorerUrl);
        }
    }

    // const snackbarContent = (
    //     <SnackbarComponent
    //         severity='info'
    //         setOpenSnackbar={setOpenSnackbar}
    //         openSnackbar={openSnackbar}
    //     >
    //         {value}
    //     </SnackbarComponent>
    // );
    // -----------------END OF SNACKBAR----------------

    // TODO:  @Junior please add a `default` to this with debugging code
    // switch (currentModal) {
    //     case 'remove':
    //         modalContent = 'Remove';
    //         modalTitle = 'Remove Position';
    //         break;

    //     case 'details':
    //         modalContent = 'details';
    //         modalTitle = '';
    //         break;
    //     case 'harvest':
    //         modalContent = 'harvest';
    //         modalTitle = 'Harvest';
    //         break;
    // }

    const openDetailsModal = () => {
        openGlobalModal(
            <TransactionDetails
                account={account}
                tx={tx}
                closeGlobalModal={closeGlobalModal}
                isBaseTokenMoneynessGreaterOrEqual={
                    isBaseTokenMoneynessGreaterOrEqual
                }
                isOnPortfolioPage={isOnPortfolioPage}
            />,
        );
    };

    // const mainModal = (
    //     <Modal onClose={closeModal} title={modalTitle}>
    //         {modalContent}
    //     </Modal>
    // );

    // const modalOrNull = isModalOpen ? mainModal : null;

    // const removeButton = userPosition ? (
    //     <button className={styles.option_button} onClick={openRemoveModal}>
    //         Remove
    //     </button>
    // ) : null;

    // const copyButton = (
    //     <button className={styles.option_button} onClick={handleCopyClick}>
    //         Copy
    //     </button>
    // );

    const isTxCopiable = tx.source !== 'manual';
    // tx.source !== 'manual' && (tx.entityType === 'swap' || tx.changeType === 'mint');

    const navigate = useNavigate();

    const copyButton =
        tx.entityType === 'liqchange' ? (
            <button
                className={styles.option_button}
                onClick={() => {
                    navigate(
                        '/trade/range/' +
                            'chain=' +
                            tx.chainId +
                            '&tokenA=' +
                            (tx.isBid ? tx.base : tx.quote) +
                            '&tokenB=' +
                            (tx.isBid ? tx.quote : tx.base) +
                            '&lowTick=' +
                            tx.bidTick +
                            '&highTick=' +
                            tx.askTick,
                    );
                    handleCopyClick();
                }}
            >
                Copy Trade
            </button>
        ) : tx.entityType === 'limitOrder' ? (
            <button
                className={styles.option_button}
                onClick={() => {
                    dispatch(setLimitTickCopied(true));
                    dispatch(setLimitTick(undefined));

                    navigate(
                        '/trade/limit/' +
                            'chain=' +
                            tx.chainId +
                            '&tokenA=' +
                            (tx.isBid ? tx.base : tx.quote) +
                            '&tokenB=' +
                            (tx.isBid ? tx.quote : tx.base) +
                            '&limitTick=' +
                            (tx.isBid ? tx.bidTick : tx.askTick),
                    );
                    handleCopyClick();
                }}
            >
                Copy Trade
            </button>
        ) : (
            <button
                className={styles.option_button}
                onClick={() => {
                    navigate(
                        '/trade/market/' +
                            'chain=' +
                            tx.chainId +
                            '&tokenA=' +
                            (tx.isBuy ? tx.base : tx.quote) +
                            '&tokenB=' +
                            (tx.isBuy ? tx.quote : tx.base),
                    );
                    handleCopyClick();
                }}
            >
                Copy Trade
            </button>
        );

    const explorerButton = (
        <button className={styles.option_button} onClick={handleOpenExplorer}>
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
        >
            Details
        </button>
    );
    // const harvestButton = userPosition ? (
    //     <button className={styles.option_button} onClick={openHarvestModal}>
    //         Harvest
    //     </button>
    // ) : null;
    // const editButton = userPosition ? (
    //     <Link className={styles.option_button} to={'/trade/edit'}>
    //         Edit
    //     </Link>
    // ) : null;

    // --------------------------------

    // const view1 = useMediaQuery('(min-width: 1280px)');
    // const view2 = useMediaQuery('(min-width: 1680px)');
    // const view3 = useMediaQuery('(min-width: 2300px)');
    // eslint-disable-next-line
    const view1NoSidebar = useMediaQuery('(min-width: 1280px)') && !showSidebar;
    const desktopView = useMediaQuery('(min-width: 768px)');

    // const view3WithNoSidebar = useMediaQuery('(min-width: 2300px)') && !showSidebar;
    // const view2WithNoSidebar = useMediaQuery('(min-width: 1680px)') && !showSidebar;

    // --------------------------------
    // const notRelevantButton = false;
    const transactionsMenu = (
        <div className={styles.actions_menu}>
            {/* {notRelevantButton && editButton} */}
            {/* {notRelevantButton && removeButton} */}
            {/* {notRelevantButton && harvestButton} */}
            {/* {(isOnPortfolioPage && !showSidebar) || (!isOnPortfolioPage && detailsButton)} */}
            {/* {view2 && explorerButton} */}
            {/* {(!showSidebar && !isOnPortfolioPage) || (view2 && copyButton)} */}
            {isTxCopiable && copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {/* {editButton} */}
            {/* {removeButton} */}
            {/* {harvestButton} */}
            {detailsButton}
            {explorerButton}
            {!desktopView && copyButton}
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
            <div onClick={() => setShowDropdownMenu(!showDropdownMenu)}>
                <FiMoreHorizontal />
            </div>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );

    return (
        <div className={styles.main_container}>
            {desktopView && transactionsMenu}

            {dropdownTransactionsMenu}

            {/* {modalOrNull} */}
            {/* {snackbarContent} */}
        </div>
    );
}
