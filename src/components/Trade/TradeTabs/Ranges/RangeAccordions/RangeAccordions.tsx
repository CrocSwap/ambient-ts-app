import styles from './RangeAccordions.module.css';
import { Dispatch, SetStateAction } from 'react';
import { PositionIF } from '../../../../../utils/interfaces/exports';
import { useProcessRange } from '../../../../../utils/hooks/useProcessRange';
import { BiWallet } from 'react-icons/bi';
import RangeStatus from '../../../../Global/RangeStatus/RangeStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowDropdown } from 'react-icons/io';
import { RiArrowUpSFill } from 'react-icons/ri';
import RangeAccordionContent from './RangeAccordionContent';

interface propsIF {
    account: string;
    i: number;
    expanded: number | boolean;
    setExpanded: Dispatch<SetStateAction<number | false>>;
    position: PositionIF;
}
export default function RangeAccordions(props: propsIF) {
    const { account, i, expanded, setExpanded, position } = props;

    const isOpen = i === expanded;

    const {
        posHashTruncated,
        userNameToDisplay,
        baseTokenLogo,
        quoteTokenLogo,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        isPositionInRange,
        isAmbient,
        ambientOrMin,
        ambientOrMax,
        usdValue,
        // baseTokenCharacter, quoteTokenCharacter,
        apy,
        apyString,
        userMatchesConnectedAccount,
        baseTokenSymbol,
        quoteTokenSymbol,
    } = useProcessRange(position, account);

    const walletAndIdDisplay = (
        <div className={styles.wallet_display}>
            <BiWallet />
            {posHashTruncated}

            <span>- {userNameToDisplay}</span>
        </div>
    );

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

    const valueDisplay = (
        <div className={styles.value_display}>
            <p>{usdValue}</p>
        </div>
    );

    const minDisplay = (
        <div className={styles.min_display}>
            <p>{ambientOrMin}</p>
        </div>
    );
    const maxDisplay = (
        <div className={styles.min_display}>
            <p>{ambientOrMax}</p>
        </div>
    );

    const aprDisplay = (
        <div className={styles.apr_display}>
            <p>{apyString}</p>
        </div>
    );

    const status = (
        <div className={styles.status}>
            <RangeStatus
                isInRange={isPositionInRange}
                isEmpty={position.totalValueUSD === 0}
                isAmbient={isAmbient}
                justSymbol
            />
        </div>
    );

    const headerData = (
        <div className={styles.header_container}>
            {walletAndIdDisplay}
            {baseTokenDisplay}
            {quoteTokenDisplay}
            {valueDisplay}
            {minDisplay}
            {maxDisplay}
            {aprDisplay}
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
                        <RangeAccordionContent
                            posHash={posHashTruncated}
                            userNameToDisplay={userNameToDisplay}
                            min={ambientOrMin}
                            max={ambientOrMax}
                            value={usdValue}
                            baseTokenSymbol={baseTokenSymbol}
                            quoteTokenSymbol={quoteTokenSymbol}
                            baseDisplay={baseDisplayFrontend}
                            quoteDisplay={quoteDisplayFrontend}
                            apr={apy}
                            isOwnerActiveAccount={userMatchesConnectedAccount}
                            isPositionInRange={isPositionInRange}
                            isAmbient={isAmbient}
                            isEmpty={position.totalValueUSD === 0}
                        />
                    </motion.section>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
