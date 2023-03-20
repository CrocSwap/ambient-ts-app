import styles from './TransactionAccordions.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowDropdown } from 'react-icons/io';
import { RiArrowUpSFill } from 'react-icons/ri';
import { TransactionIF } from '../../../../../utils/interfaces/exports';
import { useProcessTransaction } from '../../../../../utils/hooks/useProcessTransaction';
import { BiWallet } from 'react-icons/bi';
import { Dispatch, SetStateAction } from 'react';
import Price from '../../../../Global/Tabs/Price/Price';
// import TransactionTypeSide from '../../../../Global/Tabs/TypeAndSide/TransactionTypeSide/TransactionTypeSide';
import TransactionAccordionContent from './TransactionAccordionContent';

interface propsIF {
    account: string;
    i: number;
    expanded: number | boolean;
    setExpanded: Dispatch<SetStateAction<number | false>>;
    tx: TransactionIF;
}
export default function TransactionAccordions(props: propsIF) {
    const { account, i, expanded, setExpanded, tx } = props;

    const isOpen = i === expanded;
    // ----------------------------------------------------------------------

    const {
        userNameToDisplay,
        txHashTruncated,
        truncatedDisplayPrice,
        transactionTypeSide,
        // sideType,
        priceType,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        baseQuantityDisplayShort,
        quoteQuantityDisplayShort,
        blockExplorer,
        quoteTokenLogo,
        baseTokenLogo,
    } = useProcessTransaction(tx, account);

    const walletAndIdDisplay = (
        <div className={styles.wallet_display}>
            <BiWallet />
            {txHashTruncated}

            <span>- {userNameToDisplay}</span>
        </div>
    );
    // -------------

    const priceDisplay = (
        <div className={styles.price_display}>
            <p>Price:</p>

            <Price priceType={priceType} displayPrice={truncatedDisplayPrice} />
        </div>
    );
    // const sideDisplay = (
    //     <div className={styles.side_display}>

    //         <p> Side: </p>
    //         <p>{side}</p>

    //     </div>
    // )
    // const typeSideDisplay = (
    //     <div className={styles.type_display}>
    //         <p>Type:</p>
    //         <TransactionTypeSide type={sideType} side={transactionTypeSide} />
    //     </div>
    // );

    // ------------------
    const valueDisplay = (
        <div className={styles.value_display}>
            Value:
            <p>{usdValue}</p>
        </div>
    );

    const baseTokenDisplay = (
        <div className={styles.base_display}>
            <img src={baseTokenLogo} alt='base token logo' width='20px' />
            <p>{baseQuantityDisplayShort}</p>
        </div>
    );
    const quoteTokenDisplay = (
        <div className={styles.quote_display}>
            <img src={quoteTokenLogo} alt='quote token logo' width='20px' />
            <p>{quoteQuantityDisplayShort}</p>
        </div>
    );

    const headerData = (
        <div className={styles.header_container}>
            {walletAndIdDisplay}
            {priceDisplay}
            {/* {typeSideDisplay} */}
            {valueDisplay}
            {baseTokenDisplay}
            {quoteTokenDisplay}

            {/* {priceDisplay}
            {sideDisplay}
            {typeDisplay} */}
        </div>
    );

    // ----------------------------------------------------------------------

    return (
        <motion.div
            className={`${styles.main_container} ${isOpen ? styles.open_border : ''}`}
            initial={false}
            animate={{ border: isOpen ? '1px solid rgba( 255, 255, 255, 0.18 )' : '' }}
        >
            <motion.header
                initial={false}
                className={styles.main_header}
                animate={{
                    backgroundColor: isOpen ? '#171d27' : '#12171f',
                    color: isOpen ? '#EBEBFF' : '#bdbdbd',
                }}
                onClick={() => setExpanded(isOpen ? false : i)}
            >
                {headerData}
                {isOpen ? <RiArrowUpSFill /> : <IoMdArrowDropdown />}
            </motion.header>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key='content'
                        initial='collapsed'
                        animate='open'
                        exit='collapsed'
                        className={styles.accordion_content}
                        variants={{
                            open: { opacity: 1, height: 'auto' },
                            collapsed: { opacity: 0, height: 0 },
                        }}
                        transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <TransactionAccordionContent
                            txHash={txHashTruncated}
                            userNameToDisplay={userNameToDisplay}
                            price={truncatedDisplayPrice}
                            side={transactionTypeSide}
                            value={usdValue}
                            baseTokenSymbol={baseTokenSymbol}
                            quoteTokenSymbol={quoteTokenSymbol}
                            baseDisplay={baseQuantityDisplayShort}
                            quoteDisplay={quoteQuantityDisplayShort}
                            blockExplorer={blockExplorer}
                        />
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
