import { useEffect, Dispatch, SetStateAction, useRef, useState } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { ChainSpec, CrocEnv } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import styles from '../Ranges.module.css';

import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import RangesMenu from '../../../../Global/Tabs/TableMenu/TableMenuComponents/RangesMenu';
import RangeDetails from '../../../../RangeDetails/RangeDetails';
import { DefaultTooltip, TextOnlyTooltip } from '../../../../Global/StyledTooltip/StyledTooltip';
import { NavLink, useNavigate } from 'react-router-dom';
import Medal from '../../../../Global/Medal/Medal';
import NoTokenIcon from '../../../../Global/NoTokenIcon/NoTokenIcon';
import { useAppDispatch } from '../../../../../utils/hooks/reduxToolkit';
import { setDataLoadingStatus } from '../../../../../utils/state/graphDataSlice';
import moment from 'moment';
import { ZERO_ADDRESS } from '../../../../../constants';
import { FiExternalLink } from 'react-icons/fi';
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';
import { SpotPriceFn } from '../../../../../App/functions/querySpotPrice';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';

interface propsIF {
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
    showPair: boolean;
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
    cachedQuerySpotPrice: SpotPriceFn;
    setSimpleRangeWidth: Dispatch<SetStateAction<number>>;
}

export default function RangesRow(props: propsIF) {
    const {
        chainId,
        cachedQuerySpotPrice,
        // showSidebar,
        account,
        ipadView,
        showColumns,
        showPair,
        isShowAllEnabled,
        position,
        currentPositionActive,
        setCurrentPositionActive,
        openGlobalModal,
        isOnPortfolioPage,
        isLeaderboard,
        handlePulseAnimation,
        setSimpleRangeWidth,
    } = props;

    const {
        posHash,
        posHashTruncated,
        userNameToDisplay,
        ownerId,
        quoteTokenLogo,
        baseTokenLogo,
        // baseDisplay,
        // quoteDisplay,
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
        isPositionEmpty,
        isAmbient,
        baseTokenCharacter,
        quoteTokenCharacter,
        ambientOrMin,
        ambientOrMax,
        isDenomBase,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        isBaseTokenMoneynessGreaterOrEqual,
        // orderMatchesSelectedTokens,
    } = useProcessRange(position, account, isOnPortfolioPage);

    const rangeDetailsProps = {
        cachedQuerySpotPrice: cachedQuerySpotPrice,
        crocEnv: props.crocEnv,
        provider: props.provider,
        chainData: props.chainData,
        chainId: chainId,
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
        lowRangeDisplay: ambientOrMin,
        highRangeDisplay: ambientOrMax,
        baseTokenLogoURI: position.baseTokenLogoURI,
        quoteTokenLogoURI: position.quoteTokenLogoURI,
        isDenomBase: isDenomBase,
        baseTokenAddress: props.position.base,
        quoteTokenAddress: props.position.quote,
        lastBlockNumber: props.lastBlockNumber,
        positionApy: position.apy,

        closeGlobalModal: props.closeGlobalModal,
        openGlobalModal: props.openGlobalModal,
        minRangeDenomByMoneyness: minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness: maxRangeDenomByMoneyness,
    };

    const rangeMenuProps = {
        crocEnv: props.crocEnv,
        chainData: props.chainData,
        posHash: posHash as string,
        rangeDetailsProps: rangeDetailsProps,
        userMatchesConnectedAccount: userMatchesConnectedAccount,
        isPositionEmpty: isPositionEmpty,
        positionData: position,
        position: position,
        baseTokenBalance: props.baseTokenBalance,
        quoteTokenBalance: props.quoteTokenBalance,
        baseTokenDexBalance: props.baseTokenDexBalance,
        quoteTokenDexBalance: props.quoteTokenDexBalance,
        isOnPortfolioPage: props.isOnPortfolioPage,
        handlePulseAnimation: handlePulseAnimation,
    };

    const openDetailsModal = () => {
        console.log({ position });
        openGlobalModal(
            <RangeDetails
                position={position}
                account={account}
                {...rangeDetailsProps}
                isBaseTokenMoneynessGreaterOrEqual={isBaseTokenMoneynessGreaterOrEqual}
                isOnPortfolioPage={isOnPortfolioPage}
            />,
        );
    };

    const dispatch = useAppDispatch();

    const positionDomId =
        position.positionStorageSlot === currentPositionActive
            ? `position-${position.positionStorageSlot}`
            : '';

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    // console.log(rangeDetailsProps.lastBlockNumber);

    const activePositionRef = useRef(null);

    const sideCharacter = isOnPortfolioPage
        ? isBaseTokenMoneynessGreaterOrEqual
            ? baseTokenCharacter
            : quoteTokenCharacter
        : !isDenomBase
        ? baseTokenCharacter
        : quoteTokenCharacter;

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

    const usernameStyle =
        isOwnerActiveAccount && (isShowAllEnabled || isLeaderboard)
            ? 'owned_tx_contrast'
            : ensName || userNameToDisplay === 'You'
            ? 'gradient_text'
            : 'base_color';

    const activePositionStyle =
        position.positionStorageSlot === currentPositionActive ? styles.active_position_style : '';

    const [highlightRow, setHighlightRow] = useState(false);
    const highlightStyle = highlightRow ? 'var(--dark2)' : '';
    const handleRowMouseDown = () => setHighlightRow(true);
    const handleRowMouseOut = () => setHighlightRow(false);

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-40px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {posHash.toString()}
                </p>
            }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style}`}
                style={{ fontFamily: 'monospace' }}
            >
                {posHashTruncated}
            </li>
        </TextOnlyTooltip>
    );

    const ValueWithTooltip = (
        <DefaultTooltip
            interactive
            title={'$' + usdValueLocaleString}
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                data-label='value'
                className='base_color'
                // className='gradient_text'
                style={{ textAlign: 'right', fontFamily: 'monospace' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                {' '}
                {'$' + usdValue}
            </li>
        </DefaultTooltip>
    );

    const navigate = useNavigate();

    const walletWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div
                    style={{
                        marginLeft: isOwnerActiveAccount ? '-100px' : '-50px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
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
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={() => {
                    dispatch(
                        setDataLoadingStatus({
                            datasetName: 'lookupUserTxData',
                            loadingStatus: true,
                        }),
                    );
                    navigate(`/${isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId}`);
                }}
                data-label='wallet'
                className={`${usernameStyle} ${styles.hover_style}`}
                style={{ textTransform: 'lowercase', fontFamily: 'monospace' }}
            >
                {userNameToDisplay}
            </li>
        </TextOnlyTooltip>
    );

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <img src={baseTokenLogo} alt='base token' width={logoSizes} />
        ) : (
            <NoTokenIcon tokenInitial={position.baseSymbol.charAt(0)} width={logoSizes} />
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
        ) : (
            <NoTokenIcon tokenInitial={position.quoteSymbol.charAt(0)} width={logoSizes} />
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

    const tradeLinkPath =
        '/trade/range/' +
        'chain=' +
        position.chainId +
        '&tokenA=' +
        position.quote +
        '&tokenB=' +
        position.base;

    const tokenPair = (
        <DefaultTooltip
            interactive
            title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
            placement={'left'}
            arrow
            enterDelay={150}
            leaveDelay={0}
        >
            <li
                className='base_color'
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                {/* {tokensTogether} */}
                <NavLink
                    // onClick={() => {
                    //     console.log({ tx });
                    //     console.log({ tradeLinkPath });
                    // }}
                    to={tradeLinkPath}
                >
                    <p>
                        {baseTokenSymbol} / {quoteTokenSymbol}
                    </p>
                </NavLink>
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
        //     leaveDelay={0}
        // >
        <li
            onClick={openDetailsModal}
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqBaseTruncated}
                {baseTokenLogoComponent}
                {/* {isOnPortfolioPage && <img src={baseTokenLogo} width='15px' alt='' />} */}
            </div>
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
        //     leaveDelay={0}
        // >
        <li
            onClick={openDetailsModal}
            data-label={quoteTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'end',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                    fontFamily: 'monospace',
                    whiteSpace: 'nowrap',
                }}
            >
                {position.positionLiqQuoteTruncated}
                {/* {quoteDisplay} */}
                {quoteTokenLogoComponent}

                {/* {isOnPortfolioPage && <img src={quoteTokenLogo} width='15px' alt='' />} */}
            </div>
        </li>
        /* </DefaultTooltip> */
    );

    const positionTime = position.latestUpdateTime || position.timeFirstMint;

    const elapsedTimeInSecondsNum = positionTime
        ? moment(Date.now()).diff(positionTime * 1000, 'seconds')
        : 0;

    const elapsedTimeString =
        elapsedTimeInSecondsNum !== undefined
            ? elapsedTimeInSecondsNum < 60
                ? '< 1 min. '
                : elapsedTimeInSecondsNum < 120
                ? '1 min. '
                : elapsedTimeInSecondsNum < 3600
                ? `${Math.floor(elapsedTimeInSecondsNum / 60)} min. `
                : elapsedTimeInSecondsNum < 7200
                ? '1 hour '
                : elapsedTimeInSecondsNum < 86400
                ? `${Math.floor(elapsedTimeInSecondsNum / 3600)} hrs. `
                : elapsedTimeInSecondsNum < 172800
                ? '1 day '
                : `${Math.floor(elapsedTimeInSecondsNum / 86400)} days `
            : 'Pending...';

    const RangeTimeWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <p
                    style={{
                        marginLeft: '-70px',
                        background: 'var(--dark3)',
                        color: 'var(--text-grey-white)',
                        padding: '12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {'First Minted: ' +
                        moment(position.timeFirstMint * 1000).format('MM/DD/YYYY HH:mm')}
                </p>
            }
            // title={
            //     'Last Updated: ' +
            //     moment(position.latestUpdateTime * 1000).format('MM/DD/YYYY HH:mm')
            // }
            placement={'right'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <p className='base_color' style={{ fontFamily: 'monospace' }}>
                    {elapsedTimeString}
                </p>
                {/* <p className='base_color'> Nov 9 10:36:23 AM</p> */}
            </li>
        </TextOnlyTooltip>
    );
    const [showHighlightedButton, setShowHighlightedButton] = useState(false);

    return (
        <ul
            onMouseEnter={() => setShowHighlightedButton(true)}
            onMouseLeave={() => setShowHighlightedButton(false)}
            className={`${styles.row_container} ${activePositionStyle} ${userPositionStyle}`}
            onClick={() =>
                position.positionStorageSlot === currentPositionActive
                    ? null
                    : setCurrentPositionActive('')
            }
            id={positionDomId}
            ref={currentPositionActive ? activePositionRef : null}
            style={{ cursor: 'pointer', backgroundColor: highlightStyle }}
        >
            {rankingOrNull}
            {!showColumns && RangeTimeWithTooltip}
            {isOnPortfolioPage && showPair && tokenPair}
            {idOrNull}
            {/* {isOnPortfolioPage && accountTokenImages} */}
            {!showColumns && !isOnPortfolioPage && walletWithTooltip}
            {showColumns && (
                <li
                    data-label='id'
                    onClick={() => {
                        if (!isOnPortfolioPage) {
                            dispatch(
                                setDataLoadingStatus({
                                    datasetName: 'lookupUserTxData',
                                    loadingStatus: true,
                                }),
                            );
                            navigate(
                                `/${
                                    isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
                                }`,
                            );
                        } else {
                            openDetailsModal();
                        }
                    }}
                >
                    <p className={`${styles.base_color} ${styles.hover_style}`}>
                        {posHashTruncated}
                    </p>{' '}
                    <p
                        className={`${usernameStyle} ${styles.hover_style}`}
                        style={{ textTransform: 'lowercase' }}
                    >
                        {userNameToDisplay}
                    </p>
                </li>
            )}
            {!showColumns ? (
                isAmbient ? (
                    <li
                        onClick={openDetailsModal}
                        data-label='max price'
                        className='base_color'
                        // style={{ textAlign: 'right' }}
                        style={{ textAlign: 'right' }}
                        onMouseEnter={handleRowMouseDown}
                        onMouseLeave={handleRowMouseOut}
                    >
                        <span style={{ fontFamily: 'monospace' }}>{'0.00'}</span>
                    </li>
                ) : (
                    <li
                        onClick={openDetailsModal}
                        data-label='min price'
                        className='base_color'
                        style={{ textAlign: 'right' }}
                        onMouseEnter={handleRowMouseDown}
                        onMouseLeave={handleRowMouseOut}
                    >
                        <span>{sideCharacter}</span>
                        {/* <span>{isDenomBase ? quoteTokenCharacter : baseTokenCharacter}</span> */}
                        <span style={{ fontFamily: 'monospace' }}>
                            {isOnPortfolioPage && !isAmbient
                                ? minRangeDenomByMoneyness || '…'
                                : ambientOrMin || '…'}
                        </span>
                    </li>
                )
            ) : null}
            {!showColumns ? (
                isAmbient ? (
                    <li
                        onClick={openDetailsModal}
                        data-label='max price'
                        className='base_color'
                        // style={{ textAlign: 'right' }}
                        style={{ textAlign: 'right' }}
                        onMouseEnter={handleRowMouseDown}
                        onMouseLeave={handleRowMouseOut}
                    >
                        <span
                            style={{
                                fontSize: '20px',
                            }}
                        >
                            {'∞'}
                        </span>
                    </li>
                ) : (
                    <li
                        onClick={openDetailsModal}
                        data-label='max price'
                        className='base_color'
                        // style={{ textAlign: 'right' }}
                        style={{ textAlign: 'right' }}
                        onMouseEnter={handleRowMouseDown}
                        onMouseLeave={handleRowMouseOut}
                    >
                        <span>{sideCharacter}</span>
                        {/* <span>{isDenomBase ? quoteTokenCharacter : baseTokenCharacter}</span> */}
                        <span style={{ fontFamily: 'monospace' }}>
                            {isOnPortfolioPage
                                ? maxRangeDenomByMoneyness || '…'
                                : ambientOrMax || '…'}
                        </span>
                    </li>
                )
            ) : null}
            {showColumns && !ipadView && !isAmbient && (
                <li
                    data-label='side-type'
                    className='base_color'
                    style={{ textAlign: 'right' }}
                    onClick={openDetailsModal}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <p>
                        <span>{sideCharacter}</span>
                        <span style={{ fontFamily: 'monospace' }}>
                            {isOnPortfolioPage && !isAmbient
                                ? minRangeDenomByMoneyness || '…'
                                : ambientOrMin || '…'}
                        </span>
                    </p>
                    <p>
                        <span>{sideCharacter}</span>
                        <span style={{ fontFamily: 'monospace' }}>
                            {isOnPortfolioPage
                                ? maxRangeDenomByMoneyness || '…'
                                : ambientOrMax || '…'}
                        </span>
                    </p>
                </li>
            )}
            {showColumns && !ipadView && isAmbient && (
                <li
                    data-label='side-type'
                    className='base_color'
                    style={{ textAlign: 'right', whiteSpace: 'nowrap' }}
                    onClick={openDetailsModal}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <p>
                        <span className='gradient_text' style={{ textTransform: 'lowercase' }}>
                            {'ambient'}
                        </span>
                    </p>
                </li>
            )}
            {ValueWithTooltip}
            {!showColumns && baseQtyDisplayWithTooltip}
            {!showColumns && quoteQtyDisplayWithTooltip}
            {showColumns && !phoneScreen && (
                <li
                    data-label={baseTokenSymbol + quoteTokenSymbol}
                    className='base_color'
                    style={{ textAlign: 'right' }}
                    onClick={openDetailsModal}
                    onMouseEnter={handleRowMouseDown}
                    onMouseLeave={handleRowMouseOut}
                >
                    <div
                        className={styles.token_qty}
                        style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                    >
                        {position.positionLiqBaseTruncated || '0'}
                        {/* {baseDisplay} */}
                        {baseTokenLogoComponent}
                    </div>

                    <div
                        className={styles.token_qty}
                        style={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}
                    >
                        {position.positionLiqQuoteTruncated || '0'}
                        {/* {quoteDisplay} */}
                        {quoteTokenLogoComponent}
                    </div>
                </li>
            )}

            <li
                onClick={openDetailsModal}
                data-label='value'
                style={{ textAlign: 'right' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                {' '}
                <p style={{ fontFamily: 'monospace' }} className={apyClassname}>
                    {apyString}
                </p>
            </li>
            <li
                onClick={openDetailsModal}
                data-label='status'
                className='gradient_text'
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
            >
                <RangeStatus
                    isInRange={isPositionInRange}
                    isAmbient={isAmbient}
                    isEmpty={position.totalValueUSD === 0}
                    justSymbol
                />
            </li>
            <li data-label='menu' className={styles.menu}>
                <RangesMenu
                    {...rangeMenuProps}
                    showSidebar={props.showSidebar}
                    isEmpty={position.totalValueUSD === 0}
                    showHighlightedButton={showHighlightedButton}
                    setSimpleRangeWidth={setSimpleRangeWidth}
                />
            </li>
        </ul>
    );
}
