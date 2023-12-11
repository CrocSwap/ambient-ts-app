import { motion } from 'framer-motion';
import { useContext, useState, useMemo, ReactNode } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { FlexContainer, GridContainer } from '../../../styled/Common';
import {
    AcknowledgeLink,
    AcknowledgeText,
} from '../../../styled/Components/TradeModules';
import { TutorialButton } from '../../../styled/Components/Tutorial';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import ContentContainer from '../../Global/ContentContainer/ContentContainer';
import TutorialOverlay from '../../Global/TutorialOverlay/TutorialOverlay';
import Button from '../../Form/Button';

import TradeLinks from './TradeLinks';
import MultiContentComponent from '../../Global/MultiStepTransaction/MultiContentComponent';
import ShareModal from '../../Global/ShareModal/ShareModal';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { TradeDataContext } from '../../../contexts/TradeDataContext';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
type ModuleDimensions = {
    [key: string]: { height: string; width: string };
};
interface PropsIF {
    chainId: string;
    header: ReactNode;
    input: ReactNode;
    transactionDetails: ReactNode;
    modal: ReactNode | undefined;
    button: ReactNode;
    bypassConfirm: ReactNode | undefined;
    approveButton: ReactNode | undefined;
    warnings?: ReactNode | undefined;
    // eslint-disable-next-line
    tutorialSteps: any;
    isSwapPage?: boolean;
    inputOptions?: ReactNode;

    activeContent: string;
    setActiveContent: (key: string) => void;
    handleSetActiveContent: (newActiveContent: string) => void;
    moduleName: string;
    showExtraInfo: boolean;
}

export const TradeModuleSkeleton = (props: PropsIF) => {
    const {
        chainId,
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
        activeContent,
        handleSetActiveContent,
        moduleName,
        showExtraInfo,
    } = props;

    const {
        tutorial: { isActive: isTutorialActive },
        wagmiModal: { open: openWagmiModal },
    } = useContext(AppStateContext);
    const {
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);

    const { isUserConnected } = useContext(UserDataContext);

    const { limitTick } = useAppSelector((state) => state.tradeData);
    const { tokenA, tokenB } = useContext(TradeDataContext);

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
    const smallScreen = useMediaQuery('(max-width: 500px)');
    const mediumScreen = useMediaQuery('(max-width: 680px)');
    const swapPageContainerHeight = '450px';

    const moduleDimensions: ModuleDimensions = {
        Swap: {
            height: mediumScreen || showExtraInfo ? 'auto' : '500px',
            width: 'auto',
        },
        Limit: {
            height: mediumScreen || showExtraInfo ? 'auto' : '600px',
            width: 'auto',
        },
        Range: {
            height: mediumScreen || showExtraInfo ? 'auto' : '670px',
            width: 'auto',
        },
    };
    console.log(moduleDimensions[moduleName]?.height);

    const mainContent = (
        <>
            {isTutorialActive && (
                <FlexContainer
                    fullWidth
                    justifyContent='flex-end'
                    alignItems='flex-end'
                    padding='0 8px'
                >
                    <TutorialButton onClick={() => setIsTutorialEnabled(true)}>
                        Tutorial Mode
                    </TutorialButton>
                </FlexContainer>
            )}{' '}
            <ContentContainer
                isOnTradeRoute={!isSwapPage}
                noPadding={smallScreen && !isSwapPage}
                height={
                    isSwapPage
                        ? mediumScreen || showExtraInfo
                            ? 'auto'
                            : swapPageContainerHeight
                        : moduleDimensions[moduleName]?.height
                }
                width={
                    isSwapPage
                        ? mediumScreen
                            ? 'auto'
                            : '430px'
                        : moduleDimensions[moduleName]?.width
                }
            >
                {header}
                {isSwapPage || (
                    <TradeLinks
                        chainId={chainId}
                        tokenA={tokenA}
                        tokenB={tokenB}
                        limitTick={limitTick}
                    />
                )}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {input}
                </motion.div>
                {inputOptions && inputOptions}
                <FlexContainer
                    margin='8px 0 0 0'
                    padding='0 32px'
                    flexDirection='column'
                    gap={8}
                >
                    {transactionDetails}
                </FlexContainer>
                <FlexContainer
                    flexDirection='column'
                    gap={8}
                    margin='8px 0 0 0'
                    padding='0 32px'
                    style={{ marginTop: 'auto' }}
                >
                    {warnings && warnings}
                    {isUserConnected === undefined ? null : isUserConnected ===
                      true ? (
                        approveButton ? (
                            approveButton
                        ) : (
                            <>
                                {!bypassConfirm ? button : bypassConfirm}
                                {ackTokenMessage && (
                                    // NO
                                    <AcknowledgeText
                                        fontSize='body'
                                        dangerouslySetInnerHTML={{
                                            __html: formattedAckTokenMessage,
                                        }}
                                    ></AcknowledgeText>
                                )}
                                {needConfirmTokenA ||
                                    (needConfirmTokenB && (
                                        <GridContainer
                                            numCols={2}
                                            gap={16}
                                            margin='4px 0'
                                        >
                                            {needConfirmTokenA && (
                                                <AcknowledgeLink
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
                                                </AcknowledgeLink>
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
                                        </GridContainer>
                                    ))}
                            </>
                        )
                    ) : (
                        <Button
                            idForDOM='connect_wallet_button_in_trade_configurator'
                            action={openWagmiModal}
                            title='Connect Wallet'
                            flat
                        />
                    )}
                </FlexContainer>
            </ContentContainer>
            <TutorialOverlay
                isTutorialEnabled={isTutorialEnabled}
                setIsTutorialEnabled={setIsTutorialEnabled}
                steps={tutorialSteps}
            />
        </>
    );

    const confirmationContent = (
        <ContentContainer
            isOnTradeRoute={!isSwapPage}
            height={
                isSwapPage
                    ? mediumScreen
                        ? 'auto'
                        : swapPageContainerHeight
                    : moduleDimensions[moduleName]?.height
            }
            width={
                isSwapPage
                    ? mediumScreen
                        ? 'auto'
                        : '430px'
                    : moduleDimensions[moduleName]?.width
            }
        >
            {header}
            {modal}
        </ContentContainer>
    );

    const shareContent = (
        <ContentContainer
            isOnTradeRoute={!isSwapPage}
            height={
                isSwapPage
                    ? mediumScreen
                        ? 'auto'
                        : swapPageContainerHeight
                    : moduleDimensions[moduleName]?.height
            }
            width={
                isSwapPage
                    ? mediumScreen
                        ? 'auto'
                        : '430px'
                    : moduleDimensions[moduleName]?.width
            }
        >
            {header}
            <ShareModal />
        </ContentContainer>
    );

    const settingsContent = <div>I am settings</div>;

    return (
        <section>
            <MultiContentComponent
                mainContent={mainContent}
                settingsContent={settingsContent}
                confirmationContent={confirmationContent}
                activeContent={activeContent}
                setActiveContent={handleSetActiveContent}
                otherContents={[
                    {
                        title: 'share',
                        content: shareContent,
                        activeKey: 'share',
                    },
                    {
                        title: 'Other 2',
                        content: <div>Other Content 2</div>,
                        activeKey: 'example',
                    },
                ]}
            />
        </section>
    );
};
