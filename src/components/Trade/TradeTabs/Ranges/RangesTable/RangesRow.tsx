import { useEffect, Dispatch, SetStateAction, useRef } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/PositionIF';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';

import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import { DefaultTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink } from 'react-router-dom';
import Medal from '../../../../Global/Medal/Medal';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import moment from 'moment';
import { ZERO_ADDRESS } from '../../../../../constants';
import { FiExternalLink } from 'react-icons/fi';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

interface RangesRowPropsIF {
    isUserLoggedIn: boolean | undefined;
    crocEnv: CrocEnv | undefined;
    chainData: ChainSpec;
    provider: ethers.providers.Provider | undefined;
    chainId: string;
    // portfolio?: boolean;
    baseTokenBalance: string;
    quoteTokenBalance: string;
    baseTokenDexBalance: string;
    quoteTokenDexBalance: string;
    // notOnTradeRoute?: boolean;
    // isAllPositionsEnabled: boolean;
    // tokenAAddress: string;
    // tokenBAddress: string;
    // isDenomBase: boolean;
    account: string;
    lastBlockNumber: number;
    showSidebar: boolean;
    ipadView: boolean;
    showColumns: boolean;
    // blockExplorer: string | undefined;
    isShowAllEnabled: boolean;
    position: PositionIF;
    rank?: number;
    currentPositionActive: string;
    setCurrentPositionActive: Dispatch<SetStateAction<string>>;
    openGlobalModal: (content: React.ReactNode) => void;
    closeGlobalModal: () => void;
    isOnPortfolioPage: boolean;
    isLeaderboard?: boolean;
    idx: number;
    handlePulseAnimation?: (type: string) => void;
}

export default function RangesRow(props: RangesRowPropsIF) {
    const {
        // showSidebar,
        account,
        ipadView,
        showColumns,
        isShowAllEnabled,
        position,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        isOnPortfolioPage,
        isLeaderboard,
        handlePulseAnimation,
        // idx,
    } = props;

    const {
        posHash,
        posHashTruncated,
        userNameToDisplay,
        ownerId,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplay,
        quoteDisplay,
        // baseDisplayFrontend,
        // quoteDisplayFrontend,
        userMatchesConnectedAccount,
        // isOrderFilled,

        usdValue,
        usdValueLocaleString,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
        ensName,

        apyString,
        apyClassname,

        isPositionInRange,
        isAmbient,

        ambientMinOrNull,
        ambientMaxOrNull,
        isDenomBase,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        // isBaseTokenMoneynessGreaterOrEqual,
        // orderMatchesSelectedTokens,
    } = useProcessRange(position, account);

    const rangeDetailsProps = {
        crocEnv: props.crocEnv,
        provider: props.provider,
        chainData: props.chainData,
        chainId: props.chainId,
        poolIdx: position.poolIdx,
        isPositionInRange: isPositionInRange,
        isAmbient: isAmbient,
        user: position.user,
        bidTick: position.bidTick,
        askTick: position.askTick,
        baseTokenSymbol: position.baseSymbol,
        baseTokenDecimals: position.baseDecimals,
        quoteTokenSymbol: position.quoteSymbol,
        quoteTokenDecimals: position.quoteDecimals,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        lowRangeDisplay: ambientMinOrNull,
        highRangeDisplay: ambientMaxOrNull,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: props.lastBlockNumber,
        positionApy: position.apy,

        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
    };

    const rangeMenuProps = {
        crocEnv: props.crocEnv,
        chainData: props.chainData,
        posHash: posHash as string,
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        positionData: position,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        isOnPortfolioPage: props.isOnPortfolioPage,
        handlePulseAnimation: handlePulseAnimation,
    };

    const openDetailsModal = () => {
        openGlobalModal(<RangeDetails position={position} {...rangeDetailsProps} />);
    };

    const dispatch = useAppDispatch();

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    // console.log(rangeDetailsProps.lastBlockNumber);

    const activePositionRef = useRef(null);

    const clickOutsideHandler = () => {
        setCurrentPositionActive('');
    };
    useOnClickOutside(activePositionRef, clickOutsideHandler);

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

    const IDWithTooltip = (
        <DefaultTooltip
            interactive
            title={posHash.toString()}
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='id'
                className='base_color'
                style={{ fontFamily: 'monospace' }}
            >
                {posHashTruncated}
            </li>
        </DefaultTooltip>
    );

    const ValueWithTooltip = (
        <DefaultTooltip
            interactive
            title={'$' + usdValueLocaleString}
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='value'
                className='gradient_text'
                style={{ textAlign: 'right', fontFamily: 'monospace' }}
            >
                {' '}
                {'$' + usdValue}
            </li>
        </DefaultTooltip>
    );

    const walletWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                <div>
                    <p>{ensName ? ensName : ownerId}</p>
                    <NavLink
                        onClick={() => {
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'lookupUserTxData',
                                    loadingStatus: true,
                                }),
                            );
                        }}
                        to={`/${isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId}`}
                    >
                        {'View Account' + 'ㅤ'}
                        <FiExternalLink size={'12px'} />
                    </NavLink>
                </div>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li
                onClick={openDetailsModal}
                data-label='wallet'
                className={usernameStyle}
                style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
            >
                {userNameToDisplay}
            </li>
        </DefaultTooltip>
    );

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <img src={baseTokenLogo} alt='base token' width='20px' />
        ) : (
            <NoTokenIcon tokenInitial={position.baseSymbol.charAt(0)} width='20px' />
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <img src={quoteTokenLogo} alt='quote token' width='20px' />
        ) : (
            <NoTokenIcon tokenInitial={position.quoteSymbol.charAt(0)} width='20px' />
        );

    // const tokensTogether = (
    //     <div
    //         style={{
    //             display: 'flex',
    //             flexDirection: 'row',
    //             alignItems: 'center',
    //             gap: '4px',
    //         }}
    //     >
    //         {baseTokenLogoComponent}
    //         {quoteTokenLogoComponent}
    //     </div>
    // );

    // portfolio page li element ---------------
    // const accountTokenImages = (
    //     <li className={styles.token_images_account}>

    //         {tokensTogether}
    //     </li>
    // );

    const pair =
        position.base !== ZERO_ADDRESS
            ? [
                  `${position.baseSymbol}: ${position.base}`,
                  `${position.quoteSymbol}: ${position.quote}`,
              ]
            : [`${position.quoteSymbol}: ${position.quote}`];

    const tip = pair.join('\n');

    const tokenPair = (
        <DefaultTooltip
            interactive
            title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
            placement={'right'}
            arrow
            enterDelay={150}
            leaveDelay={200}
        >
            <li className='base_color'>
                {/* {tokensTogether} */}
                <p>
                    {' '}
                    {baseTokenSymbol} / {quoteTokenSymbol}
                </p>
            </li>
        </DefaultTooltip>
    );

    // const poolName = (
    //     <li className='base_color'>
    //         {baseTokenSymbol} / {quoteTokenSymbol}
    //     </li>
    // );
    // end of portfolio page li element ---------------

    // Leaderboard content--------------------------------

    // const idDisplay = !showColumns && IDWithTooltip;
    // const displayIDorRanking = isLeaderboard
    //     ? !showColumns && <Medal ranking={props.rank ?? 80} />
    //     : idDisplay;

    const idOrNull = !isLeaderboard && !showColumns ? IDWithTooltip : null;

    const rankingOrNull =
        isLeaderboard && !showColumns ? <Medal ranking={props.rank ?? 80} /> : null;

    // End of Leaderboard content--------------------------------

    // const baseQtyToolTipStyle = <p className={styles.tooltip_style}>{baseTokenSymbol + ' Qty'}</p>;
    // const quoteQtyToolTipStyle = (
    //     <p className={styles.tooltip_style}>{quoteTokenSymbol + ' Qty'}</p>
    // );
    const baseQtyDisplayWithTooltip = (
        // <DefaultTooltip
        //     interactive
        //     title={baseQtyToolTipStyle}
        //     placement={'right'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={200}
        // >
        <li onClick={openDetailsModal} data-label={baseTokenSymbol} className='color_white'>
            <p
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                }}
            >
                {baseDisplay}
                {baseTokenLogoComponent}
                {/* {isOnPortfolioPage && <img src={baseTokenLogo} width='15px' alt='' />} */}
            </p>
        </li>
        /* </DefaultTooltip> */
    );
    const quoteQtyDisplayWithTooltip = (
        // <DefaultTooltip
        //     interactive
        //     title={quoteQtyToolTipStyle}
        //     placement={'right'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={200}
        // >
        <li onClick={openDetailsModal} data-label={quoteTokenSymbol} className='color_white'>
            <p
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                }}
            >
                {quoteDisplay}
                {quoteTokenLogoComponent}

                {/* {isOnPortfolioPage && <img src={quoteTokenLogo} width='15px' alt='' />} */}
            </p>
        </li>
        /* </DefaultTooltip> */
    );

    const positionTime = position.latestUpdateTime || position.timeFirstMint;

    const elapsedTimeInSecondsNum = moment(Date.now()).diff(positionTime * 1000, 'seconds');

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. ago'
                : elapsedTimeInSecondsNum < 120
                ? '1 min. ago'
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. ago`
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour ago'
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. ago`
                : elapsedTimeInSecondsNum < 172800
                ? '1 day ago'
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days ago`
            : 'Pending...';

    const RangeTimeWithTooltip = (
        <DefaultTooltip
            interactive
            title={
                'First Minted: ' + moment(position.timeFirstMint * 1000).format('MM/DD/YYYY HH:mm')
            }
            // title={
            //     'Last Updated: ' +
            //     moment(position.latestUpdateTime * 1000).format('MM/DD/YYYY HH:mm')
            // }
            placement={'left'}
            arrow
            enterDelay={750}
            leaveDelay={200}
        >
            <li onClick={openDetailsModal} style={{ textTransform: 'lowercase' }}>
                <p className='base_color' style={{ fontFamily: 'monospace' }}>
                    {elapsedTimeString}
                </p>
                {/* <p className='base_color'> Nov 9 10:36:23 AM</p> */}
            </li>
        </DefaultTooltip>
    );

    return (
        <ul
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            onClick={() =>
                position.positionStorageSlot === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            id={positionDomId}
            ref={currentPositionActive ? activePositionRef : null}
        >
            {rankingOrNull}
            {!showColumns && RangeTimeWithTooltip}
            {isOnPortfolioPage && tokenPair}
            {idOrNull}
            {/* {isOnPortfolioPage && accountTokenImages} */}
            {!showColumns && !isOnPortfolioPage && walletWithTooltip}
            {showColumns && (
                <li data-label='id'>
                    <p className='base_color'>{posHashTruncated}</p>{' '}
                    <p className={usernameStyle} style={{ textTransform: 'lowercase' }}>
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label='min price'
                    className='color_white'
                    style={{ textAlign: 'right', fontFamily: 'monospace' }}
                >
                    {isOnPortfolioPage ? minRangeDenomByMoneyness || '…' : ambientMinOrNull || '…'}
                </li>
            )}
            {!showColumns && (
                <li
                    onClick={openDetailsModal}
                    data-label='max price'
                    className='color_white'
                    style={{ textAlign: 'right', fontFamily: 'monospace' }}
                >
                    {isOnPortfolioPage ? maxRangeDenomByMoneyness || '…' : ambientMaxOrNull || '…'}
                </li>
            )}
            {showColumns && !ipadView && (
                <li data-label='side-type' className='color_white' style={{ textAlign: 'right' }}>
                    <p>{ambientMinOrNull}</p>
                    <p>{ambientMaxOrNull}</p>
                </li>
            )}
            {ValueWithTooltip}
            {!showColumns && baseQtyDisplayWithTooltip}
            {!showColumns && quoteQtyDisplayWithTooltip}
            {showColumns && (
                <li
                    data-label={baseTokenSymbol + quoteTokenSymbol}
                    className='base_color'
                    style={{ textAlign: 'right' }}
                >
                    <p className={styles.token_qty} style={{ fontFamily: 'monospace' }}>
                        {baseDisplay}
                        {baseTokenLogoComponent}
                    </p>

                    <p className={styles.token_qty} style={{ fontFamily: 'monospace' }}>
                        {' '}
                        {quoteDisplay}
                        {quoteTokenLogoComponent}
                    </p>
                </li>
            )}
            <li onClick={openDetailsModal} data-label='value' style={{ textAlign: 'right' }}>
                {' '}
                <p style={{ fontFamily: 'monospace' }} className={apyClassname}>
                    {apyString}
                </p>
            </li>
            <li onClick={openDetailsModal} data-label='status' className='gradient_text'>
                <RangeStatus isInRange={isPositionInRange} isAmbient={isAmbient} justSymbol />
            </li>
            <li data-label='menu' className={styles.menu}>
                <RangesMenu {...rangeMenuProps} showSidebar={props.showSidebar} />
            </li>
        </ul>
    );
}
