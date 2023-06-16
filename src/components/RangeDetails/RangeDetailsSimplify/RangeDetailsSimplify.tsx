import styles from './RangeDetailsSimplify.module.css';
import { PositionIF } from '../../../utils/interfaces/exports';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { ZERO_ADDRESS } from '../../../constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import moment from 'moment';
// import Apy from '../../Global/Tabs/Apy/Apy';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { useContext } from 'react';
import { FiCopy } from 'react-icons/fi';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface RangeDetailsSimplifyPropsIF {
    position: PositionIF;
    baseFeesDisplay: string | undefined;
    quoteFeesDisplay: string | undefined;
    isAccountView: boolean;
}
export default function RangeDetailsSimplify(
    props: RangeDetailsSimplifyPropsIF,
) {
    const { position, baseFeesDisplay, quoteFeesDisplay, isAccountView } =
        props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );

    const {
        isDenomBase,
        isBaseTokenMoneynessGreaterOrEqual,
        minRangeDenomByMoneyness,
        maxRangeDenomByMoneyness,
        userNameToDisplay,
        posHashTruncated,
        posHash,
        // blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenName,
        quoteTokenName,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        isPositionInRange,
        isAmbient,
        ambientOrMax,
        ambientOrMin,
        apyString,
        width,
        blockExplorer,
        tokenAAddressLowerCase,
        tokenBAddressLowerCase,
        baseDisplayFrontend,
        quoteDisplayFrontend,
    } = useProcessRange(position, userAddress, isAccountView);

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const { chainData } = useContext(CrocEnvContext);

    const [_, copy] = useCopyToClipboard();

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount
            ? '/account'
            : `/account/${ownerId}`;
        window.open(walletUrl);
    }
    // function handleOpenExplorer() {
    //     if (posHash && blockExplorer) {
    //         const explorerUrl = `${blockExplorer}tx/${posHash}`;
    //         window.open(explorerUrl);
    //     }
    // }

    function handleCopyPositionHash() {
        copy(posHash.toString());
        openSnackbar(`${posHash.toString()} copied`, 'info');
    }

    function handleOpenBaseAddress() {
        if (tokenAAddressLowerCase && blockExplorer) {
            const adressUrl =
                tokenAAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/${chainData.addrs.dex}`
                    : `${blockExplorer}token/${tokenAAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (tokenBAddressLowerCase && blockExplorer) {
            const adressUrl = `${blockExplorer}token/${tokenBAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    // const txContent = (
    //     <div className={styles.link_row} onClick={handleOpenExplorer}>
    //         <p>{posHashTruncated}</p>
    //         <RiExternalLinkLine />
    //     </div>
    // );

    const posHashContent = (
        <div className={styles.link_row} onClick={handleCopyPositionHash}>
            <p>{posHashTruncated}</p>
            <FiCopy style={{ cursor: 'pointer' }} />
        </div>
    );
    const walletContent = (
        <div
            className={styles.link_row}
            onClick={handleOpenWallet}
            style={{ cursor: 'pointer' }}
        >
            <p>{userNameToDisplay}</p>
            <RiExternalLinkLine />
        </div>
    );

    const baseAddressContent = (
        <div
            onClick={handleOpenBaseAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div
            onClick={handleOpenQuoteAddress}
            className={styles.link_row}
            style={{ cursor: 'pointer' }}
        >
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const status = isAmbient
        ? 'Ambient'
        : isPositionInRange
        ? 'In Range'
        : 'Out of Range';

    const submissionTime = moment(position.timeFirstMint * 1000).format(
        'MM/DD/YYYY HH:mm',
    );

    const infoContent = [
        {
            title: 'Position Type ',
            content: isAmbient ? 'Ambient' : 'Range',
            explanation: 'e.g. Range, Ambient ',
        },
        {
            title: 'Position Slot ID ',
            content: posHashContent,
            // eslint-disable-next-line quotes
            explanation: "A unique identifier for this user's position",
        },

        {
            title: 'Wallet ',
            content: walletContent,
            explanation: 'The account of the position owner',
        },

        // { title: 'Add Transaction ', content: txContent, explanation: 'this is explanation' },
        // { title: 'Remove Transaction ', content: txContent, explanation: 'this is explanation' },

        {
            title: 'Add Time ',
            content: submissionTime,
            explanation:
                'The time the owner first added a range at these prices',
        },
        // { title: 'Remove Time ', content: 'remove time', explanation: 'this is explanation' },
        {
            title: 'Status ',
            content: status,
            explanation: 'e.g. Ambient / In Range / Out of Range',
        },

        {
            title: 'Token 1 ',
            content: baseTokenSymbol + ' - ' + baseTokenName,
            explanation: 'Token #1 in the token pair',
        },

        {
            title: 'Token 1 Address ',
            content: baseAddressContent,
            explanation: 'Address of token #1 in the token pair',
        },

        {
            title: 'Token 1 Qty ',
            content: baseDisplayFrontend + ' ' + baseTokenSymbol,
            explanation:
                'The quantity of token #1 in the token pair (scaled by its decimals value)',
        },

        {
            title: 'Token 2 ',
            content: quoteTokenSymbol + ' - ' + quoteTokenName,
            explanation: 'Token #2 in the token pair',
        },

        {
            title: 'Token 2 Address ',
            content: quoteAddressContent,
            explanation: 'Address of token #2 in the token pair',
        },

        {
            title: 'Token 2 Qty ',
            content: quoteDisplayFrontend + ' ' + quoteTokenSymbol,
            explanation:
                'The quantity of token #2 in the token pair (scaled by its decimals value)',
        },
        {
            title: 'Range Min ',
            content: isAmbient
                ? ambientOrMin
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${minRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${minRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMin} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMin} ${baseTokenSymbol}`,
            explanation: 'The low price boundary of the range',
        },
        {
            title: 'Range Max ',
            content: isAmbient
                ? ambientOrMax
                : isAccountView
                ? isBaseTokenMoneynessGreaterOrEqual
                    ? `1 ${quoteTokenSymbol} = ${maxRangeDenomByMoneyness} ${baseTokenSymbol}`
                    : `1 ${baseTokenSymbol} = ${maxRangeDenomByMoneyness} ${quoteTokenSymbol}`
                : isDenomBase
                ? `1 ${baseTokenSymbol} = ${ambientOrMax} ${quoteTokenSymbol}`
                : `1 ${quoteTokenSymbol} = ${ambientOrMax} ${baseTokenSymbol}`,
            explanation: 'The high price boundary of the range',
        },

        {
            title: 'Width ',
            content: isAmbient ? 'Infinite' : width + '%',
            explanation: 'The geometric range width',
        },
        {
            title: 'APR',
            content: apyString,
            explanation:
                'The estimated APR of the position based on rewards eaned',
        },

        // {
        //     title: 'Token 1 Total Rewards Earned ',
        //     content: 'T1 rewards eaned',
        //     explanation: 'this is explanation',
        // },
        // {
        //     title: 'Token 2 Total Rewards Earned ',
        //     content: 'T2 rewards eaned',
        //     explanation: 'this is explanation',
        // },
        {
            title: 'Value ',
            content: '$' + usdValue,
            explanation: 'The appoximate US dollar value of the limit order',
        },

        // { title: 'Time in Pool ', content: 'Time in Pool', explanation: 'this is explanation' },

        // { title: 'Network Fee ', content: 'network fee', explanation: 'this is explanation' },
    ];

    if (!isAmbient) {
        infoContent.push(
            {
                title: 'Token 1 Unclaimed Rewards ',
                content: baseFeesDisplay + ' ' + baseTokenSymbol,
                explanation: 'Token #1 unclaimed rewards',
            },
            {
                title: 'Token 2 Unclaimed Rewards ',
                content: quoteFeesDisplay + ' ' + quoteTokenSymbol,
                explanation: 'Token #2 unclaimed rewards',
            },
            {
                title: 'Low Tick ',
                content: position.bidTick.toString(),
                explanation:
                    'The low price boundary represented in a geometric scale',
            },
            {
                title: 'High Tick ',
                content: position.askTick.toString(),
                explanation:
                    'The high price boundary represented in a geometric scale',
            },
        );
    }

    function InfoRow(props: ItemRowPropsIF) {
        const { title, content, explanation } = props;

        return (
            <div className={styles.info_row_container}>
                <div className={styles.title_container}>
                    <p>{title}</p>
                    <TooltipComponent title={explanation} placement={'right'} />
                </div>

                <div>{content}</div>
            </div>
        );
    }

    return (
        <div className={styles.tx_details_container}>
            <div className={styles.main_container}>
                <section>
                    {infoContent
                        .slice(0, infoContent.length / 2)
                        .map((info, idx) => (
                            <InfoRow
                                key={info.title + idx}
                                title={info.title}
                                content={info.content}
                                explanation={info.explanation}
                            />
                        ))}
                </section>

                <section>
                    {infoContent
                        .slice(infoContent.length / 2, infoContent.length)
                        .map((info, idx) => (
                            <InfoRow
                                key={info.title + idx}
                                title={info.title}
                                content={info.content}
                                explanation={info.explanation}
                            />
                        ))}
                </section>
            </div>
        </div>
    );
}
