// START: Import React and Dongles
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import RemoveRange from '../../../../RemoveRange/RemoveRange';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

// START: Import Local Files
import styles from './TableMenus.module.css';
// import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import HarvestPosition from '../../../../HarvestPosition/HarvestPosition';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import UseOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import {
    setAdvancedHighTick,
    setAdvancedLowTick,
    setAdvancedMode,
    setRangeModuleTriggered,
    setSimpleRangeWidth,
} from '../../../../../utils/state/tradeDataSlice';

// interface for React functional component props
interface RangesMenuIF {
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
    positionData: PositionIF;
    posHash: string;
    showSidebar: boolean;
    isOnPortfolioPage: boolean;

    handlePulseAnimation?: (type: string) => void;
}

// React functional component
export default function RangesMenu(props: RangesMenuIF) {
    const menuItemRef = useRef<HTMLDivElement>(null);

    const {
        crocEnv,
        // chainData,
        userMatchesConnectedAccount,
        rangeDetailsProps,
        posHash,
        positionData,
        isOnPortfolioPage,
        handlePulseAnimation,
        // showSidebar,
        // eslint-disable-next-line
    } = props;

    const { openGlobalModal } = rangeDetailsProps;

    const currentLocation = location.pathname;

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

    const openRemoveModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(<RemoveRange position={positionData} {...rangeDetailsProps} />);
    };

    const openDetailsModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(<RangeDetails position={positionData} {...rangeDetailsProps} />);
    };

    const openHarvestModal = () => {
        setShowDropdownMenu(false);
        openGlobalModal(
            <HarvestPosition crocEnv={crocEnv} position={positionData} {...rangeDetailsProps} />,
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

        if (positionData.positionType === 'ambient') {
            dispatch(setSimpleRangeWidth(100));
            dispatch(setAdvancedMode(false));
        } else {
            dispatch(setAdvancedLowTick(positionData.bidTick));
            dispatch(setAdvancedHighTick(positionData.askTick));
            dispatch(setAdvancedMode(true));
        }
        setShowDropdownMenu(false);

        dispatch(setRangeModuleTriggered(true));
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

    const repositionButton =
        !isAmbient && positionMatchesLoggedInUser && !isPositionInRange ? (
            <Link className={styles.reposition_button} to={'/trade/reposition'}>
                Reposition
            </Link>
        ) : null;

    const removeButton = positionMatchesLoggedInUser ? (
        <button className={styles.option_button} onClick={openRemoveModal}>
            Remove
        </button>
    ) : null;

    const copyButton = (
        <Link
            className={styles.option_button}
            to={
                '/trade/range/' +
                (isOnPortfolioPage
                    ? 'chain=' +
                      positionData.chainId +
                      '&tokenA=' +
                      positionData.base +
                      '&tokenB=' +
                      positionData.quote
                    : currentLocation.slice(currentLocation.indexOf('chain')))
            }
            onClick={handleCopyClick}
        >
            Copy Trade
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

    const editButton = positionMatchesLoggedInUser ? (
        <Link
            className={styles.option_button}
            to={`/trade/edit/${posHash}`}
            state={{ position: positionData }}
            replace={currentLocation.startsWith('/trade/edit')}
        >
            Edit
        </Link>
    ) : null;

    // ----------------------

    const noRespositionButton = !isAmbient && positionMatchesLoggedInUser && !isPositionInRange;

    const view1 = useMediaQuery('(min-width: 1280px)');
    // const view2 = useMediaQuery('(min-width: 1680px)');
    const view3 = useMediaQuery('(min-width: 2300px)');

    // const view1NoSidebar = useMediaQuery('(min-width: 1280px)') && !showSidebar;
    // const view3WithNoSidebar = useMediaQuery('(min-width: 2300px)') && !showSidebar;

    // ----------------------

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {view1 && repositionButton}
            {view1 && !noRespositionButton && userMatchesConnectedAccount && editButton}
            {/* {view1 && !noRespositionButton && !isOnPortfolioPage && editButton} */}
            {view3 && harvestButton}
            {/* {view2 && removeButton} */}
            {view3 && detailsButton}
            {!userMatchesConnectedAccount && copyButton}
            {/* {view1 && !props.showSidebar && copyButton} */}
        </div>
    );

    // console.log(posHash);

    const menuContent = (
        <div className={styles.menu_column}>
            {repositionButton}
            {!view1 && !noRespositionButton && userMatchesConnectedAccount && editButton}
            {harvestButton}
            {removeButton}
            {detailsButton}
            {/* {copyButton} */}
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
        </div>
    );
}
