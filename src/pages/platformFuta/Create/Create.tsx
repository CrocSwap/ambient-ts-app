import { useContext, useEffect, useState } from 'react';
import styles from './Create.module.css';
import useDebounce from '../../../App/hooks/useDebounce';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { AppStateContext } from '../../../contexts/AppStateContext';
import BreadCrumb from '../../../components/Futa/Breadcrumb/Breadcrumb';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { AuctionsContext } from '../../../contexts/AuctionsContext';
import TooltipLabel from '../../../components/Futa/TooltipLabel/TooltipLabel';
import {
    checkTickerPattern,
    checkTickerValidity,
    createAuction,
    AuctionTxResponseIF,
} from '../../../ambient-utils/dataLayer';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import { CrocEnv } from '@crocswap-libs/sdk';
import { useNavigate } from 'react-router-dom';
import { CURRENT_AUCTION_VERSION } from '../../../ambient-utils/constants';
import SynthwaveGrid from '../Home/Animations/SynthwaveGrid';
import { getActionTrigger } from '../../../components/Chat/ChatRenderUtils';

export default function Create() {
    const desktopScreen = useMediaQuery('(min-width: 1080px)');
    const navigate = useNavigate();

    const { isUserConnected } = useContext(UserDataContext);
    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const {
        walletModal: { open: openWalletModal },
    } = useContext(AppStateContext);

    const { tickerInput, setTickerInput } = useContext(AuctionsContext);

    const [isValidationInProgress, setIsValidationInProgress] =
        useState<boolean>(false);

    const [isValidated, setIsValidated] = useState<boolean>(false);
    const [tickerCreationResponse, setTickerCreationResponse] = useState<
        AuctionTxResponseIF | undefined
    >();
    const [isTxPending, setIsTxPending] = useState<boolean>(false);
    const [invalidReason, setInvalidReason] = useState<string | undefined>();

    function handleChange(text: string) {
        const sanitized = text.trim();
        if (checkTickerPattern(sanitized)) {
            setIsValidationInProgress(true);
            setTickerInput(sanitized.toUpperCase());
        }
    }

    const debouncedTickerInput = useDebounce(tickerInput, 500);

    useEffect(() => {
        if (!lastBlockNumber || !crocEnv || !debouncedTickerInput) return;
        checkTickerValidity(
            crocEnv,
            debouncedTickerInput,
            lastBlockNumber,
        ).then((response) => {
            setIsValidationInProgress(false);
            setIsValidated(response.isValid);
            setInvalidReason(response.invalidReason);
        });
    }, [debouncedTickerInput, crocEnv === undefined, lastBlockNumber]);

    useEffect(() => {
        setTickerCreationResponse(undefined);
        setIsTxPending(false);
    }, [tickerInput]);

    // name for the ticker input field, keeps `<input/>` and `<label/>` sync'd
    const TICKER_INPUT_ID = 'ticker_input';
    const TICKER_MAX_LENGTH = 10;

    useEffect(() => {
        const input = document.getElementById(
            TICKER_INPUT_ID,
        ) as HTMLInputElement;
        if (input) input.focus();
    }, []);

    const liquidity = '0.25 ETH';

    const networkFee = 0.01;
    const extraInfoData = [
        {
            id: 'auctions_create_liquidity',
            title: 'LIQUIDITY',
            tooltipTitle: 'liquidity',
            data: liquidity,
        },
        {
            id: 'auctions_create_network_fee',
            title: 'NETWORK FEE',
            tooltipTitle: 'NETWORK FEE PAID IN ORDER TO TRANSACT',
            data: networkFee ? '~' + networkFee : '...',
        },
    ];

    const createHeader = (
        <div className={styles.create_token_top}>
            {!desktopScreen && <BreadCrumb />}
            <h3>CREATE</h3>
            <p className={styles.description}>
                Some text here describing how launching a token works and what
                things will happen.
            </p>
        </div>
    );

    const extraInfoDisplay = (
        <div className={styles.extraInfoContainer}>
            {extraInfoData.map((item, idx) => (
                <div id={item.id} className={styles.justifyRow} key={idx}>
                    <TooltipLabel
                        itemTitle={item.title}
                        tooltipTitle={item.tooltipTitle}
                    />
                    <p style={{ color: 'var(--text2)', fontSize: '14px' }}>
                        {item.data}
                    </p>
                </div>
            ))}
        </div>
    );

    const tokenTicker = (
        <div className={styles.create_token_middle}>
            <div className={styles.ticker_input_fields}>
                <label htmlFor={TICKER_INPUT_ID}>
                    <h4>Token Ticker</h4>
                </label>
                <div className={styles.inputContainer}>
                    <input
                        name={TICKER_INPUT_ID}
                        id={TICKER_INPUT_ID}
                        value={tickerInput}
                        type='text'
                        maxLength={TICKER_MAX_LENGTH}
                        onChange={(e) => handleChange(e.target.value)}
                        autoCorrect='off'
                        spellCheck='false'
                        autoComplete='off'
                    />
                    <p>{TICKER_MAX_LENGTH - tickerInput.length}</p>
                </div>
            </div>
        </div>
    );

    const sendCreationTransaction = async (
        crocEnv: CrocEnv | undefined,
        tickerInput: string,
    ) => {
        setIsTxPending(true);

        setTickerCreationResponse(await createAuction(crocEnv, tickerInput));
    };

    const tickerCreationFailed =
        tickerCreationResponse?.isSuccess !== undefined
            ? tickerCreationResponse.isSuccess === false
            : false;

    const tickerCreationSucceeded =
        tickerCreationResponse?.isSuccess !== undefined
            ? tickerCreationResponse.isSuccess === true
            : false;

    const displayPendingTxMessage =
        isTxPending && tickerCreationResponse === undefined;

    const isButtonDisabled =
        displayPendingTxMessage ||
        tickerCreationResponse?.isSuccess === false ||
        (isUserConnected && (isValidationInProgress || !isValidated));

    const footerDisplay = (
        <footer className={styles.footerContainer}>
            {extraInfoDisplay}
            <button
                id={!isUserConnected ? 'auctions_create_connect_button' : 'auctions_create_button'}
                className={
                    !isButtonDisabled
                        ? styles.create_button
                        : styles.create_button_disabled
                }
                onClick={() =>
                    !isUserConnected
                        ? openWalletModal()
                        : tickerCreationSucceeded
                          ? navigate(
                                `/auctions/v${CURRENT_AUCTION_VERSION}/${tickerInput}`,
                            )
                          : sendCreationTransaction(crocEnv, tickerInput)
                }
                disabled={isButtonDisabled}
            >
                {!isUserConnected
                    ? 'Connect Wallet'
                    : displayPendingTxMessage
                      ? 'Creation Pending...'
                      : tickerCreationFailed
                        ? 'Creation Failed'
                        : tickerCreationSucceeded
                          ? 'Go To Auction'
                          : tickerInput === ''
                            ? 'Enter a Token Ticker'
                            : isValidationInProgress
                              ? 'Validating Ticker...'
                              : isValidated
                                ? 'Create Auction'
                                : `${invalidReason}: ${tickerInput}`}
            </button>
        </footer>
    );

    return (
        <section className={styles.mainContainer}>
            <div className={styles.create_token}>
                {createHeader}

                {tokenTicker}
                {footerDisplay}
            </div>

            <SynthwaveGrid hasVideoPlayedOnce isCreatePage />
            {getActionTrigger('create_auction_input_trigger', () => {setTickerInput('MY TOKEN')})}
            {getActionTrigger('create_auction_reset', () => {setTickerInput('')})}
        </section>
    );
}
