import TooltipComponent from '../../TooltipComponent/TooltipComponent';
import { TransactionIF } from '../../../../utils/interfaces/exports';
import { RiExternalLinkLine } from 'react-icons/ri';

import styles from './TransactionDetailsSimplify.module.css';
import { useProcessTransaction } from '../../../../utils/hooks/useProcessTransaction';
import { ZERO_ADDRESS } from '../../../../constants';

interface ItemRowPropsIF {
    title: string;
    // eslint-disable-next-line
    content: any;
    explanation: string;
}

interface TransactionDetailsSimplifyPropsIF {
    tx: TransactionIF;
    account: string;
}
export default function TransactionDetailsSimplify(props: TransactionDetailsSimplifyPropsIF) {
    const { account, tx } = props;
    const {
        userNameToDisplay,
        txHashTruncated,
        txHash,
        blockExplorer,
        isOwnerActiveAccount,
        ownerId,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseTokenAddressTruncated,
        quoteTokenAddressTruncated,

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
        baseTokenAddress,
        quoteTokenAddress,
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
    } = useProcessTransaction(tx, account);

    function handleOpenWallet() {
        const walletUrl = isOwnerActiveAccount ? '/account' : `/account/${ownerId}`;
        window.open(walletUrl);
    }
    function handleOpenExplorer() {
        if (txHash && blockExplorer) {
            const explorerUrl = `${blockExplorer}tx/${txHash}`;
            window.open(explorerUrl);
        }
    }
    function handleOpenBaseAddress() {
        if (txHash && blockExplorer) {
            const adressUrl =
                baseTokenAddress === ZERO_ADDRESS
                    ? `${blockExplorer}address/0xfafcd1f5530827e7398b6d3c509f450b1b24a209`
                    : `${blockExplorer}address/${baseTokenAddress}`;
            window.open(adressUrl);
        }
    }
    function handleOpenQuoteAddress() {
        if (txHash && blockExplorer) {
            const adressUrl = `${blockExplorer}address/${quoteTokenAddress}`;
            window.open(adressUrl);
        }
    }
    const txContent = (
        <div className={styles.link_row} onClick={handleOpenExplorer}>
            <p>{txHashTruncated}</p>
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
    // Create a data array for the info and map through it here
    const infoContent = [
        { title: 'Position Type ', content: 'Market', explanation: 'this is explanation' },

        { title: 'Wallet ', content: walletContent, explanation: 'this is explanation' },

        { title: 'Transaction ', content: txContent, explanation: 'this is explanation' },

        { title: 'Time ', content: 'this is time', explanation: 'this is explanation' },

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

        { title: 'Price ', content: 'price', explanation: 'this is explanation' },
        { title: 'Value ', content: usdValue, explanation: 'this is explanation' },

        {
            title: 'Liquidity Provider Fee ',
            content: 'liquidity fee',
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
                {infoContent.map((info, idx) => (
                    <InfoRow
                        key={info.title + idx}
                        title={info.title}
                        content={info.content}
                        explanation={info.explanation}
                    />
                ))}
            </div>
        </div>
    );
}
