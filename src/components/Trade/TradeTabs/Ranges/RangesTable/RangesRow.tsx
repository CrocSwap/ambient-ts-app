import { useEffect, Dispatch, SetStateAction } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import { ambientPosSlot, ChainSpec, concPosSlot, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';

interface RangesRowPropsIF {
    // isUserLoggedIn: boolean;
    // crocEnv: CrocEnv | undefined;
    // chainData: ChainSpec;
    // provider: ethers.providers.Provider | undefined;
    // chainId: string;
    // portfolio?: boolean;
    // baseTokenBalance: string;
    // quoteTokenBalance: string;
    // baseTokenDexBalance: string;
    // quoteTokenDexBalance: string;
    // notOnTradeRoute?: boolean;
    // isAllPositionsEnabled: boolean;
    // tokenAAddress: string;
    // tokenBAddress: string;
    // isAuthenticated: boolean;
    // account?: string;
    // isDenomBase: boolean;
    // lastBlockNumber: number;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;
    // blockExplorer: string | undefined;
    isShowAllEnabled: boolean;
    position: PositionIF;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
}

export default function RangesRow(props: RangesRowPropsIF) {
    const {
        showSidebar,
        ipadView,
        showColumns,
        isShowAllEnabled,
        position,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        closeGlobalModal,
    } = props;

    const {
        posHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        userMatchesConnectedAccount,
        // isOrderFilled,

        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        // isOwnerActiveAccount,
        ensName,

        apy,
        apyString,
        apyClassname,

        isPositionInRange,
        isAmbient,

        positionMatchesSelectedTokens,

        ambientMinOrNull,
        ambientMaxOrNull,
        // orderMatchesSelectedTokens,
    } = useProcessRange(position);

    const openDetailsModal = () => console.log('opening detail modal');

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    function scrollToDiv() {
        const element = document.getElementById(positionDomId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }

    useEffect(() => {
        position.positionStorageSlot === currentPositionActive ? scrollToDiv() : null;
    }, [currentPositionActive]);

    const userPositionStyle =
        userNameToDisplay === 'You' && isShowAllEnabled ? styles.border_left : null;

    const usernameStyle = ensName || userMatchesConnectedAccount ? 'gradient_text' : 'base_color';

    const activePositionStyle =
        position.positionStorageSlot === currentPositionActive ? styles.active_position_style : '';

    return (
        <ul
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            onClick={() =>
                position.positionStorageSlot === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            id={positionDomId}
        >
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='id' className='base_color'>
                    {posHashTruncated}
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='wallet' className={usernameStyle}>
                    {userNameToDisplay}
                </li>
            )}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{posHashTruncated}</p>{' '}
                    <p className={usernameStyle}>{userNameToDisplay}</p>
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label='min price' className='color_white'>
                    {ambientMinOrNull}
                </li>
            )}

            {!showColumns && (
                <li onClick={openDetailsModal} data-label='max price' className='color_white'>
                    {ambientMaxOrNull}
                </li>
            )}
            {/* {!showColumns && (
            <li onClick={openDetailsModal} data-label='type' className={sideTypeStyle}>
                {type}
            </li>
        )} */}
            {showColumns && !ipadView && (
                <li data-label='side-type' className='color_white'>
                    <p>{ambientMinOrNull}</p>
                    <p>{ambientMaxOrNull}</p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value' className='gradient_text'>
                {' '}
                {usdValue}
            </li>

            {!showColumns && (
                <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='base_color'>
                    <p>{baseDisplay}</p>
                </li>
            )}
            {!showColumns && (
                <li onClick={openDetailsModal} data-label={quoteTokenSymbol} className='base_color'>
                    <p>{quoteDisplay}</p>
                </li>
            )}
            {showColumns && (
                <li data-label={baseTokenSymbol + quoteTokenSymbol} className='base_color'>
                    <p className={styles.align_center}>
                        {' '}
                        <img src={baseTokenLogo} alt='' width='15px' />
                        {baseDisplay}{' '}
                    </p>

                    <p className={styles.align_center}>
                        {' '}
                        <img src={quoteTokenLogo} alt='' width='15px' />
                        {quoteDisplay}
                    </p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value'>
                {' '}
                <p className={apyClassname}>{apyString}</p>
            </li>
            <li onClick={openDetailsModal} data-label='status' className='gradient_text'>
                <RangeStatus isInRange={isPositionInRange} isAmbient={isAmbient} justSymbol />
            </li>

            <li data-label='menu' style={{ width: showColumns ? '50px' : '100px' }}>
                ....
            </li>
        </ul>
    );
}
