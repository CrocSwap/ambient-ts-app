import { motion } from 'framer-motion';
import { useContext, useState, useMemo } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { useTradeData } from '../../../App/hooks/useTradeData';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { ConnectWalletButton } from '../../Global/ConnectWalletButton/ConnectWalletButton';
import ContentContainer from '../../Global/ContentContainer/ContentContainer';
import TutorialOverlay from '../../Global/TutorialOverlay/TutorialOverlay';
import styles from './TradeModuleSkeleton.module.css';

interface PropsIF {
    header: React.ReactNode;
    input: React.ReactNode;
    transactionDetails: React.ReactNode;
    modal: React.ReactNode | undefined;
    button: React.ReactNode;
    bypassConfirm: React.ReactNode | undefined;
    approveButton: React.ReactNode | undefined;
    warnings?: React.ReactNode | undefined;
    // eslint-disable-next-line
    tutorialSteps: any;
    isSwapPage?: boolean;
    inputOptions?: React.ReactNode;
}

export const TradeModuleSkeleton = (props: PropsIF) => {
    const {
        isSwapPage,
        header,
        input,
        inputOptions,
        transactionDetails,
        modal,
        button,
        bypassConfirm,
        approveButton,
        warnings,
        tutorialSteps,
    } = props;

    const {
        tutorial: { isActive: isTutorialActive },
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );
    const { tokenA, tokenB } = useAppSelector((state) => state.tradeData);
    const navigationMenu = !isSwapPage ? useTradeData().navigationMenu : null;

    const [isTutorialEnabled, setIsTutorialEnabled] = useState(false);

    // values if either token needs to be confirmed before transacting
    const needConfirmTokenA = !tokens.verify(tokenA.address);
    const needConfirmTokenB = !tokens.verify(tokenB.address);
    // token acknowledgement needed message (empty string if none needed)
    const ackTokenMessage = useMemo<string>(() => {
        // !Important   any changes to verbiage in this code block must be approved
        // !Important   ... by Doug, get in writing by email or request specific
        // !Important   ... review for a pull request on GitHub
        let text: string;
        if (needConfirmTokenA && needConfirmTokenB) {
            text = `The tokens ${tokenA.symbol || tokenA.name} and ${
                tokenB.symbol || tokenB.name
            } are not listed on any major reputable token list. Please be sure these are the actual tokens you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenA) {
            text = `The token ${
                tokenA.symbol || tokenA.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else if (needConfirmTokenB) {
            text = `The token ${
                tokenB.symbol || tokenB.name
            } is not listed on any major reputable token list. Please be sure this is the actual token you want to trade. Many fraudulent tokens will use the same name and symbol as other major tokens. Always conduct your own research before trading.`;
        } else {
            text = '';
        }
        return text;
    }, [needConfirmTokenA, needConfirmTokenB]);

    const formattedAckTokenMessage = ackTokenMessage.replace(
        /\b(not)\b/g,
        '<span style="color: var(--negative); text-transform: uppercase;">$1</span>',
    );

    return (
        <section className={styles.scrollable_container}>
            {isTutorialActive && (
                <div className={styles.tutorial_button_container}>
                    <button
                        className={styles.tutorial_button}
                        onClick={() => setIsTutorialEnabled(true)}
                    >
                        Tutorial Mode
                    </button>
                </div>
            )}{' '}
            <ContentContainer isOnTradeRoute={!isSwapPage}>
                {header}
                {navigationMenu}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {input}
                </motion.div>
                {inputOptions && inputOptions}
                <div className={styles.info_button_container}>
                    {transactionDetails}
                    {isUserConnected === undefined ? null : isUserConnected ===
                      true ? (
                        approveButton ? (
                            approveButton
                        ) : (
                            <>
                                {!bypassConfirm ? button : bypassConfirm}
                                {ackTokenMessage && (
                                    // NO
                                    <p
                                        className={styles.acknowledge_text}
                                        dangerouslySetInnerHTML={{
                                            __html: formattedAckTokenMessage,
                                        }}
                                    ></p>
                                )}
                                {needConfirmTokenA ||
                                    (needConfirmTokenB && (
                                        <div
                                            className={
                                                styles.acknowledge_etherscan_links
                                            }
                                        >
                                            {needConfirmTokenA && (
                                                <a
                                                    href={
                                                        blockExplorer +
                                                        'token/' +
                                                        tokenA.address
                                                    }
                                                    rel={'noopener noreferrer'}
                                                    target='_blank'
                                                    aria-label={`approve ${tokenA.symbol}`}
                                                >
                                                    {tokenA.symbol ||
                                                        tokenA.name}{' '}
                                                    <FiExternalLink />
                                                </a>
                                            )}
                                            {needConfirmTokenB && (
                                                <a
                                                    href={
                                                        blockExplorer +
                                                        'token/' +
                                                        tokenB.address
                                                    }
                                                    rel={'noopener noreferrer'}
                                                    target='_blank'
                                                    aria-label={`approve ${tokenB.symbol}`}
                                                >
                                                    {tokenB.symbol ||
                                                        tokenB.name}{' '}
                                                    <FiExternalLink />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                            </>
                        )
                    ) : (
                        <ConnectWalletButton onClick={openWagmiModal} />
                    )}
                    {warnings && warnings}
                </div>
            </ContentContainer>
            {modal && modal}
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={tutorialSteps}
            />
        </section>
    );
};
