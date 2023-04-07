import { FiCopy, FiExternalLink } from 'react-icons/fi';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import {
    DefaultTooltip,
    TextOnlyTooltip,
} from '../../../Global/StyledTooltip/StyledTooltip';
import styles from './Transactions.module.css';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { NavLink } from 'react-router-dom';
import moment from 'moment';
import { IS_LOCAL_ENV, ZERO_ADDRESS } from '../../../../constants';

interface Props {
    txHash: string;
    txHashTruncated: string;
    sideTypeStyle: string;
    usdValue: string;
    usernameStyle: string;
    userNameToDisplay: string;
    baseTokenLogo: string;
    baseTokenSymbol: string;
    baseTokenAddress: string;
    baseQuantityDisplayShort: string;
    quoteTokenLogo: string;
    quoteTokenSymbol: string;
    quoteTokenAddress: string;
    quoteQuantityDisplayShort: string;
    elapsedTimeString: string;

    isOnPortfolioPage: boolean;
    handleCopyTxHash: () => void;
    handleOpenExplorer: () => void;
    openDetailsModal: () => void;
    handleRowMouseDown: () => void;
    handleRowMouseOut: () => void;

    tx: TransactionIF;
}
export const useProcessTxRow = (props: Props) => {
    const {
        txHash,
        handleCopyTxHash,
        handleOpenExplorer,
        txHashTruncated,
        openDetailsModal,
        handleRowMouseDown,
        handleRowMouseOut,
        sideTypeStyle,
        usdValue,
        usernameStyle,
        userNameToDisplay,
        baseTokenLogo,
        baseTokenSymbol,
        baseTokenAddress,
        quoteTokenLogo,
        quoteTokenSymbol,
        quoteTokenAddress,
        isOnPortfolioPage,
        tx,
        elapsedTimeString,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
    } = props;

    const phoneScreen = useMediaQuery('(max-width: 500px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const logoSizes = phoneScreen ? '10px' : smallScreen ? '15px' : '20px';

    const IDWithTooltip = (
        <TextOnlyTooltip
            interactive
            title={
                <div className={styles.id_tooltip_style}>
                    {txHash + 'ㅤ'}
                    <FiCopy size={'12px'} onClick={handleCopyTxHash} />{' '}
                    <FiExternalLink
                        size={'12px'}
                        onClick={handleOpenExplorer}
                    />
                </div>
            } // invisible space character added
            placement={'left'}
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                data-label='id'
                className={`${styles.base_color} ${styles.hover_style} ${styles.mono_font}`}
                tabIndex={0}
            >
                {txHashTruncated}
            </li>
        </TextOnlyTooltip>
    );

    const usdValueWithTooltip = (
        <li
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            onClick={openDetailsModal}
            data-label='value'
            className={sideTypeStyle}
            style={{ textAlign: 'right' }}
            tabIndex={0}
        >
            {usdValue}
        </li>
    );

    // const handleWalletClick = () => {
    //     dispatch(
    //         setDataLoadingStatus({
    //             datasetName: 'lookupUserTxData',
    //             loadingStatus: true,
    //         }),
    //     );

    //     const accountUrl = `/${
    //         isOwnerActiveAccount ? 'account' : ensName ? ensName : ownerId
    //     }`;
    //     window.open(accountUrl);
    // };

    const walletWithTooltip = (
        <li
            // onClick={handleWalletClick}
            onClick={openDetailsModal}
            data-label='wallet'
            className={`${usernameStyle} ${styles.hover_style}`}
            style={{ textTransform: 'lowercase' }}
            tabIndex={0}
        >
            {userNameToDisplay}
        </li>
    );

    const baseTokenLogoComponent =
        baseTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <p>
                        {baseTokenSymbol}
                        {`${
                            baseTokenSymbol === 'ETH'
                                ? ''
                                : ': ' + baseTokenAddress
                        }`}
                    </p>
                }
                placement={'left'}
                disableHoverListener={!isOnPortfolioPage}
                arrow
                enterDelay={750}
                leaveDelay={0}
            >
                <img src={baseTokenLogo} alt='base token' width={logoSizes} />
            </DefaultTooltip>
        ) : (
            <IconWithTooltip
                title={`${baseTokenSymbol}: ${baseTokenAddress}`}
                placement='bottom'
            >
                <NoTokenIcon
                    tokenInitial={tx.baseSymbol.charAt(0)}
                    width={logoSizes}
                />
            </IconWithTooltip>
        );

    const quoteTokenLogoComponent =
        quoteTokenLogo !== '' ? (
            <DefaultTooltip
                interactive
                title={
                    <div>
                        {quoteTokenSymbol}: {quoteTokenAddress}
                    </div>
                }
                placement={'left'}
                disableHoverListener={!isOnPortfolioPage}
                arrow
                enterDelay={750}
                leaveDelay={0}
            >
                <img src={quoteTokenLogo} alt='quote token' width={logoSizes} />
            </DefaultTooltip>
        ) : (
            <IconWithTooltip
                title={`${quoteTokenSymbol}: ${quoteTokenAddress}`}
                placement='right'
            >
                <NoTokenIcon
                    tokenInitial={tx.quoteSymbol.charAt(0)}
                    width={logoSizes}
                />
            </IconWithTooltip>
        );

    const pair =
        tx.base !== ZERO_ADDRESS
            ? [`${tx.baseSymbol}: ${tx.base}`, `${tx.quoteSymbol}: ${tx.quote}`]
            : [`${tx.quoteSymbol}: ${tx.quote}`];

    const tradeLinkPath =
        (tx.entityType.toLowerCase() === 'limitorder'
            ? '/trade/limit/'
            : tx.entityType.toLowerCase() === 'liqchange'
            ? '/trade/range/'
            : '/trade/market/') +
        'chain=' +
        tx.chainId +
        '&tokenA=' +
        tx.quote +
        '&tokenB=' +
        tx.base;

    const tokenPair = (
        // <DefaultTooltip
        //     interactive
        //     title={<div style={{ whiteSpace: 'pre-line' }}>{tip}</div>}
        //     placement={'left'}
        //     arrow
        //     enterDelay={150}
        //     leaveDelay={0}
        // >
        <li
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
        >
            <NavLink to={tradeLinkPath}>
                {baseTokenSymbol} / {quoteTokenSymbol}
            </NavLink>
        </li>

        // </DefaultTooltip>
    );

    const TxTimeWithTooltip = (
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
                    {moment(tx.time * 1000).format('MM/DD/YYYY HH:mm')}
                </p>
            }
            placement={'right'}
            arrow
            enterDelay={750}
            leaveDelay={0}
        >
            <li
                onClick={openDetailsModal}
                style={{ textTransform: 'lowercase' }}
                onMouseEnter={handleRowMouseDown}
                onMouseLeave={handleRowMouseOut}
                tabIndex={0}
            >
                <p className='base_color'>{elapsedTimeString}</p>
            </li>
        </TextOnlyTooltip>
    );

    const baseQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={baseTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {baseQuantityDisplayShort}
                {baseTokenLogoComponent}
            </div>
        </li>
    );
    const quoteQtyDisplayWithTooltip = (
        <li
            onClick={openDetailsModal}
            data-label={quoteTokenSymbol}
            className='base_color'
            onMouseEnter={handleRowMouseDown}
            onMouseLeave={handleRowMouseOut}
            tabIndex={0}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '4px',
                    textAlign: 'right',
                }}
            >
                {quoteQuantityDisplayShort}
                {quoteTokenLogoComponent}
            </div>
        </li>
    );

    return { IDWithTooltip };
};
