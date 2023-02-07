import styles from './RangeDetailsSimplify.module.css';
import { PositionIF } from '../../../utils/interfaces/exports';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { ZERO_ADDRESS } from '../../../constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import moment from 'moment';
import Apy from '../../Global/Tabs/Apy/Apy';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface RangeDetailsSimplifyPropsIF {
    position: PositionIF;
    account: string;
}
export default function RangeDetailsSimplify(props: RangeDetailsSimplifyPropsIF) {
    const { account, position } = props;

    const {
        userNameToDisplay,
        posHashTruncated,
        posHash,
        // blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,
        isPositionInRange,
        isAmbient,
        ambientOrMax,
        ambientOrMin,
        apyString,

        blockExplorer,
        tokenAAddressLowerCase,
        tokenBAddressLowerCase,
        baseDisplayFrontend,
        quoteDisplayFrontend,
    } = useProcessRange(position, account);

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount ? '/account' : `/account/${ownerId}`;
        window.open(walletUrl);
    }
    function handleOpenExplorer() {
        if (posHash && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${posHash}`;
            window.open(explorerUrl);
        }
    }
    function handleOpenBaseAddress() {
        if (posHash && blockExplorer) {
            const adressUrl =
                tokenAAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/0xfafcd1f5530827e7398b6d3c509f450b1b24a209`
                    : `${blockExplorer}address/${tokenAAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (posHash && blockExplorer) {
            const adressUrl = `${blockExplorer}address/${tokenBAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    const txContent = (
        <div className={styles.link_row} onClick={handleOpenExplorer}>
            <p>{posHashTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const walletContent = (
        <div className={styles.link_row} onClick={handleOpenWallet}>
            <p>{userNameToDisplay}</p>
            <RiExternalLinkLine />
        </div>
    );

    const baseAddressContent = (
        <div onClick={handleOpenBaseAddress} className={styles.link_row}>
            <p>{baseTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );
    const quoteAddressContent = (
        <div onClick={handleOpenQuoteAddress} className={styles.link_row}>
            <p>{quoteTokenAddressTruncated}</p>
            <RiExternalLinkLine />
        </div>
    );

    const status = isAmbient ? 'Ambient' : isPositionInRange ? 'In Range' : 'Out of Range';

    const submissionTime = moment(position.timeFirstMint * 1000).format('MM/DD/YYYY HH:mm');
    // const fillTime = moment(position.latestCrossPivotTime * 1000).format('MM/DD/YYYY HH:mm');

    const infoContent = [
        { title: 'Position Type ', content: 'Range', explanation: 'this is explanation' },

        { title: 'Wallet ', content: walletContent, explanation: 'this is explanation' },

        { title: 'Add Transaction ', content: txContent, explanation: 'this is explanation' },
        { title: 'Remove Transaction ', content: txContent, explanation: 'this is explanation' },

        { title: 'Add Time ', content: submissionTime, explanation: 'this is explanation' },
        { title: 'Remove Time ', content: 'remove time', explanation: 'this is explanation' },
        { title: 'Status ', content: status, explanation: 'this is explanation' },

        { title: 'Token 1 ', content: baseTokenSymbol, explanation: 'this is explanation' },

        {
            title: 'Token 1 Address ',
            content: baseAddressContent,
            explanation: 'this is explanation',
        },

        {
            title: 'Token 1 Qty ',
            content: baseDisplayFrontend + baseTokenSymbol,
            explanation: 'this is explanation',
        },

        { title: 'Token 2 ', content: quoteTokenSymbol, explanation: 'this is explanation' },

        {
            title: 'Token 2 Address ',
            content: quoteAddressContent,
            explanation: 'this is explanation',
        },

        {
            title: 'Token 2 Qty ',
            content: quoteDisplayFrontend + quoteTokenSymbol,
            explanation: 'this is explanation',
        },
        {
            title: 'Range Min ',
            content: ambientOrMin,
            explanation: 'this is explanation',
        },
        {
            title: 'Range Max ',
            content: ambientOrMax,
            explanation: 'this is explanation',
        },
        {
            title: 'APR',
            content: apyString + '%',
            explanation: 'this is explanation',
        },

        {
            title: 'Token 1 Total Fees Earned ',
            content: 'T1 fees earned',
            explanation: 'this is explanation',
        },
        {
            title: 'Token 2 Total Fees Earned ',
            content: 'T2 fees earned',
            explanation: 'this is explanation',
        },
        {
            title: 'Token 1 Unclaimed Fees ',
            content: 'T1 unclaimed fees',
            explanation: 'this is explanation',
        },
        {
            title: 'Token 2 Unclaimed Fees ',
            content: 'T2 unclaimed fees',
            explanation: 'this is explanation',
        },
        { title: 'Time in Pool ', content: 'Time in Pool', explanation: 'this is explanation' },
        { title: 'Value ', content: usdValue, explanation: 'this is explanation' },

        { title: 'Network Fee ', content: 'network fee', explanation: 'this is explanation' },
    ];

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
                    {infoContent.slice(0, infoContent.length / 2).map((info, idx) => (
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
