// START: Import React and Dongles
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMoreHorizontal } from 'react-icons/fi';

// START: Import JSX Functional Components
import RemoveRange from '../../../../RemoveRange/RemoveRange';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import SnackbarComponent from '../../../../../components/Global/SnackbarComponent/SnackbarComponent';

// START: Import Local Files
import styles from './TableMenuComponents.module.css';
import useCopyToClipboard from '../../../../../utils/hooks/useCopyToClipboard';
import { DefaultTooltip } from '../../../StyledTooltip/StyledTooltip';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import HarvestPosition from '../../../../HarvestPosition/HarvestPosition';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';

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
}

// React functional component
export default function RangesMenu(props: RangesMenuIF) {
    const {
        crocEnv,
        // chainData,
        userMatchesConnectedAccount,
        rangeDetailsProps,
        posHash,
        positionData,
        // eslint-disable-next-line
    } = props;

    const { openGlobalModal } = rangeDetailsProps;

    const currentLocation = location.pathname;
    const { isAmbient, isPositionInRange } = rangeDetailsProps;
    // eslint-disable-next-line
    const [value, copy] = useCopyToClipboard();
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const [openMenuTooltip, setOpenMenuTooltip] = useState(false);

    const feesGreaterThanZero =
        (positionData.feesLiqBaseDecimalCorrected || 0) +
            (positionData.feesLiqQuoteDecimalCorrected || 0) >
        0;

    const positionHasLiquidity =
        (positionData.positionLiqBaseDecimalCorrected || 0) +
            (positionData.positionLiqQuoteDecimalCorrected || 0) >
        0;

    // ---------------------MODAL FUNCTIONALITY----------------

    const openRemoveModal = () =>
        openGlobalModal(<RemoveRange position={positionData} {...rangeDetailsProps} />);

    const openDetailsModal = () =>
        openGlobalModal(<RangeDetails position={positionData} {...rangeDetailsProps} />);

    const openHarvestModal = () =>
        openGlobalModal(
            <HarvestPosition crocEnv={crocEnv} position={positionData} {...rangeDetailsProps} />,
        );

    // -----------------SNACKBAR----------------
    function handleCopyAddress() {
        copy(posHash);
        setOpenSnackbar(true);
    }

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
        !isAmbient && userMatchesConnectedAccount && !isPositionInRange ? (
            <Link className={styles.reposition_button} to={'/trade/reposition'}>
                Reposition
            </Link>
        ) : null;

    const removeButton =
        userMatchesConnectedAccount && positionHasLiquidity ? (
            <button className={styles.option_button} onClick={openRemoveModal}>
                Remove
            </button>
        ) : null;
    const copyButton = isPositionInRange ? (
        <button className={styles.option_button} onClick={handleCopyAddress}>
            Copy Trade
        </button>
    ) : null;

    const detailsButton = (
        <button className={styles.option_button} onClick={openDetailsModal}>
            Details
        </button>
    );
    const harvestButton =
        !isAmbient && feesGreaterThanZero && userMatchesConnectedAccount ? (
            <button className={styles.option_button} onClick={openHarvestModal}>
                Harvest
            </button>
        ) : null;

    const editButton =
        userMatchesConnectedAccount && positionHasLiquidity ? (
            <Link
                className={styles.option_button}
                to={`/trade/edit/${posHash}`}
                state={{ position: positionData }}
                replace={currentLocation.startsWith('/trade/edit')}
            >
                Edit
            </Link>
        ) : null;

    const rangesMenu = (
        <div className={styles.actions_menu}>
            {repositionButton}
            {editButton}
            {harvestButton}
            {removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    // console.log(posHash);

    const menuContent = (
        <div className={styles.menu_column}>
            {userMatchesConnectedAccount && editButton}
            {userMatchesConnectedAccount && harvestButton}
            {userMatchesConnectedAccount && removeButton}
            {detailsButton}
            {copyButton}
        </div>
    );

    const dropdownRangesMenu = (
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
            {rangesMenu}
            {dropdownRangesMenu}
            {snackbarContent}
        </>
    );
}
