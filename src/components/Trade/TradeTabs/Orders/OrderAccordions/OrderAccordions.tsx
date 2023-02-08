import styles from './OrderAccordions.module.css';
import { Dispatch, SetStateAction } from 'react';
import { useProcessOrder } from '../../../../../utils/hooks/useProcessOrder';
import { BiWallet } from 'react-icons/bi';
import OpenOrderStatus from '../../../../Global/OpenOrderStatus/OpenOrderStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowDropdown } from 'react-icons/io';
import { RiArrowUpSFill } from 'react-icons/ri';
import OrderAccordionContent from './OrderAccordionContent';
import { LimitOrderIF } from '../../../../../utils/interfaces/exports';

interface propsIF {
    account: string;
    i: number;
    expanded: number | boolean;
    setExpanded: Dispatch<SetStateAction<number | false>>;
    limitOrder: LimitOrderIF;
}
export default function OrderAccordions(props: propsIF) {
    const { account, i, expanded, setExpanded, limitOrder } = props;

    const isOpen = i === expanded;

    const {
        posHashTruncated,
        userNameToDisplay,
        quoteTokenLogo,
        baseTokenLogo,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isOrderFilled,
        truncatedDisplayPrice,
        sideType,
        usdValue,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOwnerActiveAccount,
    } = useProcessOrder(limitOrder, account);

    const walletAndIdDisplay = (
        <div className={styles.wallet_display}>
            <BiWallet />
            {posHashTruncated}

            <span>- {userNameToDisplay}</span>
        </div>
    );
    // -------------
    const baseTokenDisplay = (
        <div className={styles.base_display}>
            <img src={baseTokenLogo} alt='base token logo' width='20px' />
            <p>{baseDisplayFrontend}</p>
        </div>
    );
    const quoteTokenDisplay = (
        <div className={styles.quote_display}>
            <img src={quoteTokenLogo} alt='quote token logo' width='20px' />
            <p>{quoteDisplayFrontend}</p>
        </div>
    );

    const status = (
        <div className={styles.status}>
            <OpenOrderStatus isFilled={isOrderFilled} />
        </div>
    );

    const priceDisplay = (
        <div className={styles.price}>
            <p>{truncatedDisplayPrice}</p>
        </div>
    );
    const sideDisplay = (
        <div className={styles.side}>
            <p>{sideType}</p>
        </div>
    );
    const typeDisplay = (
        <div className={styles.type}>
            <p>{'type'}</p>
        </div>
    );
    const valueDisplay = (
        <div className={styles.value}>
            <p>{usdValue}</p>
        </div>
    );

    const headerData = (
        <div className={styles.header_container}>
            {walletAndIdDisplay}
            {priceDisplay}
            {sideDisplay}
            {typeDisplay}
            {valueDisplay}
            {baseTokenDisplay}
            {quoteTokenDisplay}
            {status}
        </div>
    );

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
                        <OrderAccordionContent
                            posHash={posHashTruncated}
                            userNameToDisplay={userNameToDisplay}
                            price={truncatedDisplayPrice}
                            side={sideType}
                            baseTokenSymbol={baseTokenSymbol}
                            quoteTokenSymbol={quoteTokenSymbol}
                            value={usdValue}
                            baseDisplay={baseDisplayFrontend}
                            quoteDisplay={quoteDisplayFrontend}
                            isOrderFilled={isOrderFilled}
                            isOwnerActiveAccount={isOwnerActiveAccount}
                        />
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
