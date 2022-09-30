// START: Import React and Dongles
import { useState, ReactNode, useEffect } from 'react';
// import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';
import Modal from '../../../../Global/Modal/Modal';

// START: Import Local Files
import styles from './TableMenuComponents.module.css';
import { useModal } from '../../../../Global/Modal/useModal';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { ILimitOrderState } from '../../../../../utils/state/graphDataSlice';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';

// interface for React functional component props
interface OrdersMenuIF {
    limitOrder: ILimitOrderState;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
}

// React functional component
export default function OrdersMenu(props: OrdersMenuIF) {
    const lastBlockNumber = useAppSelector((state) => state.graphData).lastBlock;

    const { limitOrder, openGlobalModal } = props;
    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [
        isModalOpen,
        //  openModal,
        closeModal,
    ] = useModal();

    const [
        currentModal,
        //  setCurrentModal
    ] = useState<string>('edit');

    const [openMenuTooltip, setOpenMenuTooltip] = useState(false);

    // ---------------------MODAL FUNCTIONALITY----------------
    let modalContent: ReactNode;

    let modalTitle;

    // function openRemoveModal() {
    //     setCurrentModal('remove');
    //     openModal();
    // }

    // function openDetailsModal() {
    //     setCurrentModal('details');
    //     openModal();
    // }

    // -----------------SNACKBAR----------------
    function handleCopyAddress() {
        copy('example data');
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );
    // -----------------END OF SNACKBAR----------------

    const [posLiqBaseDecimalCorrected, setPosLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [posLiqQuoteDecimalCorrected, setPosLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();
    const [feesBaseDecimalCorrected, setFeeLiqBaseDecimalCorrected] = useState<
        number | undefined
    >();
    const [feesQuoteDecimalCorrected, setFeeLiqQuoteDecimalCorrected] = useState<
        number | undefined
    >();

    console.log({ posLiqQuoteDecimalCorrected });

    const positionStatsCacheEndpoint = 'https://809821320828123.de:5000/position_stats?';

    useEffect(() => {
        if (
            limitOrder.chainId &&
            limitOrder.poolIdx &&
            limitOrder.user &&
            limitOrder.base &&
            limitOrder.quote &&
            limitOrder.bidTick &&
            limitOrder.askTick
        ) {
            (async () => {
                // console.log('fetching details');
                fetch(
                    positionStatsCacheEndpoint +
                        new URLSearchParams({
                            chainId: limitOrder.chainId,
                            user: limitOrder.user,
                            base: limitOrder.base,
                            quote: limitOrder.quote,
                            poolIdx: limitOrder.poolIdx.toString(),
                            bidTick: limitOrder.bidTick.toString(),
                            askTick: limitOrder.askTick.toString(),
                            addValue: 'true',
                            positionType: 'knockout',
                            isBid: limitOrder.isBid.toString(),
                            omitAPY: 'true',
                            ensResolution: 'true',
                        }),
                )
                    .then((response) => response.json())
                    .then((json) => {
                        console.log({ json });
                        setPosLiqBaseDecimalCorrected(json?.data?.positionLiqBaseDecimalCorrected);
                        setPosLiqQuoteDecimalCorrected(
                            json?.data?.positionLiqQuoteDecimalCorrected,
                        );
                        setFeeLiqBaseDecimalCorrected(json?.data?.feesLiqBaseDecimalCorrected);
                        setFeeLiqQuoteDecimalCorrected(json?.data?.feesLiqQuoteDecimalCorrected);
                    });
            })();
        }
    }, [limitOrder, lastBlockNumber]);

    const openRemoveModal = () => openGlobalModal(removalContent);
    const openDetailsModal = () => openGlobalModal(detailsContent);

    const removalContent = (
        <div>
            <div>Removal Details:</div>
            <div>Liquidity Base Qty: {posLiqBaseDecimalCorrected}</div>
            <div>Liquidity Quote Qty: {posLiqQuoteDecimalCorrected}</div>
            <div>Fees Base Qty: {feesBaseDecimalCorrected}</div>
            <div>Fees Quote Qty: {feesQuoteDecimalCorrected}</div>
        </div>
    );
    const detailsContent = (
        <div>
            <div>Removal Details:</div>
            <div>Liquidity Base Qty: {posLiqBaseDecimalCorrected}</div>
            <div>Liquidity Quote Qty: {posLiqQuoteDecimalCorrected}</div>
            <div>Fees Base Qty: {feesBaseDecimalCorrected}</div>
            <div>Fees Quote Qty: {feesQuoteDecimalCorrected}</div>
        </div>
    );

    switch (currentModal) {
        case 'remove':
            // modalContent = <RemoveRange {...removeRangeProps} />;
            modalContent = removalContent;
            modalTitle = 'Limit Order Removal';
            break;

        case 'details':
            // modalContent = <RangeDetails {...removeRangeProps} />;
            modalContent = detailsContent;
            modalTitle = 'Limit Order Details';
            break;
    }

    const mainModal = (
        <Modal onClose={closeModal} title={modalTitle}>
            {modalContent}
        </Modal>
    );

    const modalOrNull = isModalOpen ? mainModal : null;

    // ------------------  END OF MODAL FUNCTIONALITY-----------------

    // const relimitOrderButton = userlimitOrder ? (
    //     <Link className={styles.relimitOrder_button} to={'/trade/relimitOrder'}>
    //         RelimitOrder
    //     </Link>
    // ) : null;

    const removeButton = limitOrder ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;
    const copyButton = limitOrder ? (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Copy Trade
        </button>
    ) : null;
    const detailsButton = (
        <button className={styles.option_button} onClick={openDetailsModal}>
            Details
        </button>
    );
    // const editButton = userlimitOrder ? (
    //     <Link className={styles.option_button} to={'/trade/edit'}>
    //         Edit
    //     </Link>
    // ) : null;

    const ordersMenu = (
        <div className={styles.actions_menu}>
            {/* {relimitOrderButton}
            {editButton} */}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const menuContent = (
        <div className={styles.menu_column}>
            {/* {editButton} */}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const dropdownOrdersMenu = (
        <div className={styles.dropdown_menu}>
            <DefaultTooltip
                open={openMenuTooltip}
                onOpen={() => setOpenMenuTooltip(true)}
                onClose={() => setOpenMenuTooltip(false)}
                interactive
                placement='left'
                title={menuContent}
            >
                <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => setOpenMenuTooltip(!openMenuTooltip)}
                >
                    <FiMoreHorizontal size={20} />
                </div>
            </DefaultTooltip>
        </div>
    );
    return (
        <>
            {ordersMenu}
            {dropdownOrdersMenu}
            {modalOrNull}
            {snackbarContent}
        </>
    );
}
