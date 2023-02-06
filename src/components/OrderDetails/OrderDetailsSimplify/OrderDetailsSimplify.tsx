import styles from './OrderDetailsSimplify.module.css';
import { LimitOrderIF } from '../../../utils/interfaces/exports';
import { ZERO_ADDRESS } from '../../../constants';
import { RiExternalLinkLine } from 'react-icons/ri';
import { useProcessOrder } from '../../../utils/hooks/useProcessOrder';
import TooltipComponent from '../../Global/TooltipComponent/TooltipComponent';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface OrderDetailsSimplifyPropsIF {
    limitOrder: LimitOrderIF;
    account: string;
}
export default function OrderDetailsSimplify(props: OrderDetailsSimplifyPropsIF) {
    const { account, limitOrder } = props;

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
        isOrderFilled,

        // isDenomBase,
        // baseTokenLogo,
        // quoteTokenLogo,
        // lowPriceDisplay,
        // highPriceDisplay,
        // bidTick,
        // askTick,
        // positionLiqTotalUSD,

        // baseDisplay,
        // quoteDisplay,
        blockExplorer,
        baseTokenAddressLowerCase,
        quoteTokenAddressLowerCase,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        // truncatedLowDisplayPrice,
        // truncatedHighDisplayPrice,
        // truncatedDisplayPrice,
        // truncatedLowDisplayPriceDenomByMoneyness,
        // truncatedHighDisplayPriceDenomByMoneyness,
        // truncatedDisplayPriceDenomByMoneyness,
        // isBaseTokenMoneynessGreaterOrEqual,
        // positionLiquidity,
    } = useProcessOrder(limitOrder, account);

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
                baseTokenAddressLowerCase === ZERO_ADDRESS
                    ? `${blockExplorer}address/0xfafcd1f5530827e7398b6d3c509f450b1b24a209`
                    : `${blockExplorer}address/${baseTokenAddressLowerCase}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (posHash && blockExplorer) {
            const adressUrl = `${blockExplorer}address/${quoteTokenAddressLowerCase}`;
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

    const status = isOrderFilled ? 'Filled' : 'Not Filled';

    const infoContent = [
        { title: 'Position Type ', content: 'Market', explanation: 'this is explanation' },

        { title: 'Wallet ', content: walletContent, explanation: 'this is explanation' },

        { title: 'Submit Transaction ', content: txContent, explanation: 'this is explanation' },
        { title: 'Claim Transaction ', content: txContent, explanation: 'this is explanation' },

        { title: 'Submit Time ', content: 'this is time', explanation: 'this is explanation' },
        { title: 'Fill Time ', content: 'this is time', explanation: 'this is explanation' },
        { title: 'Status ', content: status, explanation: 'this is explanation' },

        { title: 'From Token ', content: baseTokenSymbol, explanation: 'this is explanation' },

        { title: 'From Address ', content: baseAddressContent, explanation: 'this is explanation' },

        {
            title: 'From Qty ',
            content: baseDisplayFrontend + baseTokenSymbol,
            explanation: 'this is explanation',
        },

        { title: 'To Token ', content: quoteTokenSymbol, explanation: 'this is explanation' },

        { title: 'To Address ', content: quoteAddressContent, explanation: 'this is explanation' },

        {
            title: 'To Qty ',
            content: quoteDisplayFrontend + quoteTokenSymbol,
            explanation: 'this is explanation',
        },

        { title: 'Realized Price ', content: 'price', explanation: 'this is explanation' },
        { title: 'Fill Start ', content: 'price', explanation: 'this is explanation' },
        { title: 'Fill End ', content: 'price', explanation: 'this is explanation' },
        { title: 'Value ', content: usdValue, explanation: 'this is explanation' },

        {
            title: 'Rebate Rate ',
            content: 'rebate rate',
            explanation: 'this is explanation',
        },

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
                    {infoContent.slice(0, 10).map((info, idx) => (
                        <InfoRow
                            key={info.title + idx}
                            title={info.title}
                            content={info.content}
                            explanation={info.explanation}
                        />
                    ))}
                </section>

                <section>
                    {infoContent.slice(10, infoContent.length).map((info, idx) => (
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
