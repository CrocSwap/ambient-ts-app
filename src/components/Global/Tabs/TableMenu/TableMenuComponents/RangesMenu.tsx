// START: Import React and Dongles
import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import RemoveRange from '../../../../RemoveRange/RemoveRange';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

// START: Import Local Files
import styles from './TableMenus.module.css';
// import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import HarvestPosition from '../../../../HarvestPosition/HarvestPosition';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
} from '../../../../../utils/state/tradeDataSlice';
import { useModal } from '../../../Modal/useModal';
import Modal from '../../../Modal/Modal';

// interface for React functional component props
interface propsIF {
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    userMatchesConnectedAccount: boolean | undefined;
    // todoFromJr: Assign the correct types to these data -Jr
    // eslint-disable-next-line
    rangeDetailsProps: any;
    position: PositionIF;
    posHash: string;
    showSidebar: boolean;
    isOnPortfolioPage: boolean;
    isPositionEmpty: boolean;
    handlePulseAnimation?: (type: string) => void;
    showHighlightedButton: boolean;
    isEmpty: boolean;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

// React functional component
export default function RangesMenu(props: propsIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        crocEnv,
        isEmpty,
        // chainData,
        isPositionEmpty,
        userMatchesConnectedAccount,
        rangeDetailsProps,
        posHash,
        position,
        // isOnPortfolioPage,
        handlePulseAnimation,
        // showHighlightedButton,
        setSimpleRangeWidth,
    } = props;

    const { openGlobalModal } = rangeDetailsProps;

    // const currentLocation = location.pathname;

    const { isAmbient, isPositionInRange } = rangeDetailsProps;
    // eslint-disable-next-line
    // const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    // const feesGreaterThanZero =
    //     (positionData.feesLiqBaseDecimalCorrected || 0) +
    //         (positionData.feesLiqQuoteDecimalCorrected || 0) >
    //     0;

    // const positionHasLiquidity =
    //     (positionData.positionLiqBaseDecimalCorrected || 0) +
    //         (positionData.positionLiqQuoteDecimalCorrected || 0) >
    //     0;

    // ---------------------MODAL FUNCTIONALITY----------------
    const [isRemoveRangeModalOpen, openRemoveRangeModal, closeRemoveRangeModal] = useModal();
    const handleModalClose = () => {
        closeRemoveRangeModal();
        setShowDropdownMenu(false);
        console.log('clicked');
    };

    const removeRangeModalOrNull = isRemoveRangeModalOpen ? (
        <Modal onClose={handleModalClose} title='Remove Position' noHeader>
            <RemoveRange position={position} {...rangeDetailsProps} />
        </Modal>
    ) : null;

    // const openRemoveModal = () => {
    //     setShowDropdownMenu(false);
    //     openGlobalModal(<RemoveRange position={position} {...rangeDetailsProps} />);
    // };

    const openDetailsModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(<RangeDetails position={position} {...rangeDetailsProps} />);
    };

    const openHarvestModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(
            <HarvestPosition crocEnv={crocEnv} position={position} {...rangeDetailsProps} />,
        );
    };

    const isUserLoggedIn = useAppSelector((state) => state.userData).isLoggedIn;

    const positionMatchesLoggedInUser = userMatchesConnectedAccount && isUserLoggedIn;
    // const isDenomBase = tradeData.isDenomBase

    const handleCopyClick = () => {
        // console.log('copy clicked');
        // console.log({ positionData });
        {
            handlePulseAnimation ? handlePulseAnimation('range') : null;
        }

        if (position.positionType === 'ambient') {
            setSimpleRangeWidth(100);
            dispatch(setAdvancedMode(false));
        } else {
            console.log({ position });
            dispatch(setAdvancedLowTick(position.bidTick));
            dispatch(setAdvancedHighTick(position.askTick));
            dispatch(setAdvancedMode(true));
        }
        setShowDropdownMenu(false);
    };

    // -----------------SNACKBAR----------------
    // function handleCopyAddress() {
    //     copy(posHash);
    //     setOpenSnackbar(true);
    // }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {posHash} copied
        </SnackbarComponent>
    );
    // -----------------END OF SNACKBAR----------------

    const repositionButton = (
        // !isAmbient && positionMatchesLoggedInUser && !isPositionInRange ?
        <Link
            className={styles.reposition_button}
            to={
                '/trade/reposition/chain=' +
                position.chainId +
                '&tokenA=' +
                position.base +
                '&tokenB=' +
                position.quote +
                '&lowTick=' +
                position.bidTick +
                '&highTick=' +
                position.askTick
            }
            state={{ position: position }}
        >
            Reposition
        </Link>
    );
    //  : null;

    const removeButton = positionMatchesLoggedInUser ? (
        <button className={styles.option_button} onClick={openRemoveRangeModal}>
            Remove
        </button>
    ) : null;

    const copyButton = position ? (
        <Link
            style={{ opacity: '1' }}
            // style={{ opacity: showHighlightedButton ? '1' : '0.2' }}
            className={styles.option_button}
            to={
                '/trade/range/' +
                // (isOnPortfolioPage
                // ?
                'chain=' +
                position.chainId +
                '&tokenA=' +
                position.base +
                '&tokenB=' +
                position.quote +
                '&lowTick=' +
                position.bidTick +
                '&highTick=' +
                position.askTick
                // : currentLocation.slice(currentLocation.indexOf('chain')) )
            }
            onClick={handleCopyClick}
        >
            Copy Trade
        </Link>
    ) : null;

    const addButton = (
        <Link
            style={{ opacity: '1' }}
            className={styles.option_button}
            to={
                '/trade/range/' +
                // (isOnPortfolioPage
                // ?
                'chain=' +
                position.chainId +
                '&tokenA=' +
                position.base +
                '&tokenB=' +
                position.quote +
                '&lowTick=' +
                position.bidTick +
                '&highTick=' +
                position.askTick
                // : currentLocation.slice(currentLocation.indexOf('chain')))
            }
            onClick={handleCopyClick}
        >
            Add
        </Link>
    );

    const detailsButton = (
        <button className={styles.option_button} onClick={openDetailsModal}>
            Details
        </button>
    );
    const harvestButton =
        !isAmbient && positionMatchesLoggedInUser ? (
            <button className={styles.option_button} onClick={openHarvestModal}>
                Harvest
            </button>
        ) : null;

    // const editButton = positionMatchesLoggedInUser ? (
    //     <Link
    //         style={{ opacity: showHighlightedButton ? '1' : '0.2' }}
    //         className={styles.option_button}
    //         to={`/trade/edit/${posHash}`}
    //         state={{ position: positionData }}
    //         replace={currentLocation.startsWith('/trade/edit')}
    //     >
    //         Edit
    //     </Link>
    // ) : null;

    // ----------------------

    // const noRespositionButton = !isAmbient && positionMatchesLoggedInUser && !isPositionInRange;

    const view1 = useMediaQuery('(min-width: 720px)');
    const view2 = useMediaQuery('(min-width: 1380px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    // const view1NoSidebar = useMediaQuery('(min-width: 1280px)') && !showSidebar;
    // const view3WithNoSidebar = useMediaQuery('(min-width: 2300px)') && !showSidebar;
    const showRepositionButton =
        !isPositionInRange && !isPositionEmpty && userMatchesConnectedAccount && view1;
    // ----------------------

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {/* {!showRepositionButton && view2 && detailsButton} */}
            {showRepositionButton && repositionButton}
            {!showRepositionButton && userMatchesConnectedAccount && addButton}
            {view2 && !isEmpty && removeButton}
            {/* {view2 && !noRespositionButton && userMatchesConnectedAccount && editButton} */}
            {/* {view2 && !noRespositionButton && !isOnPortfolioPage && editButton} */}
            {view3 && !isEmpty && harvestButton}
            {/* {view2 && removeButton} */}
            {/* {view3 && detailsButton} */}
            {!userMatchesConnectedAccount && copyButton}
            {/* {!userMatchesConnectedAccount && view2 && copyButton} */}
            {/* {view2 && !props.showSidebar && copyButton} */}
        </div>
    );

    // console.log(posHash);

    const menuContent = (
        <div className={styles.menu_column}>
            {/* {!view1 && !isPositionInRange && repositionButton} */}
            {/* {!view1 && !noRespositionButton && userMatchesConnectedAccount && editButton} */}
            {!view3 && !isEmpty && harvestButton}
            {!view2 && !isEmpty && removeButton}
            {detailsButton}
            {userMatchesConnectedAccount && copyButton}
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
            <div onClick={() => setShowDropdownMenu(!showDropdownMenu)}>
                <FiMoreHorizontal />
            </div>
            <div className={wrapperStyle}>{menuContent}</div>
        </div>
    );

    useEffect(() => {
        if (showDropdownMenu) {
            const interval = setTimeout(() => {
                setShowDropdownMenu(false);
            }, 5000);
            console.log('running');
            return () => clearTimeout(interval);
        } else return;
    }, [showDropdownMenu]);

    return (
        <div className={styles.main_container}>
            {rangesMenu}
            {dropdownRangesMenu}
            {snackbarContent}
            {removeRangeModalOrNull}
        </div>
    );
}
