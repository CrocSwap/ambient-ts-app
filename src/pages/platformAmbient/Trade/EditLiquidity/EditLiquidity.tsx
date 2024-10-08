// START: Import React and Dongles
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import { CrocEditPosition } from '@crocswap-libs/sdk';

// START: Import Other Local Files
import styles from './EditLiquidity.module.css';
import { PositionIF } from '../../../../ambient-utils/types';

import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { useProcessRange } from '../../../../utils/hooks/useProcessRange';
import RepositionHeader from '../../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import { TradeDataContext } from '../../../../contexts/TradeDataContext';
import Range from '../Range/Range';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { RangeContext } from '../../../../contexts/RangeContext';
import { ChainDataContext } from '../../../../contexts/ChainDataContext';
import { ReceiptContext } from '../../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { getPositionHash } from '../../../../ambient-utils/dataLayer/functions/getPositionHash';
import { IS_LOCAL_ENV } from '../../../../ambient-utils/constants';
import {
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../../utils/TransactionError';

function EditLiquidity() {
    const { params } = useParams();
    const { crocEnv } = useContext(CrocEnvContext);
    const { lastBlockNumber } = useContext(ChainDataContext);
    const { getDefaultRangeWidthForTokenPair } = useContext(TradeDataContext);
    const { setCurrentRangeInEdit } = useContext(RangeContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const locationHook = useLocation();
    const linkGenPool: linkGenMethodsIF = useLinkGen('pool');

    // navigate the user to the redirect URL path if locationHook.state has no data
    // ... this value will be truthy if the user arrived here by clicking a link
    // ... inside the app, but will be empty if they navigated manually to the path
    if (!locationHook.state) {
        // log in console if conditions are such to trigger an automatic URL redirect
        // this will help troubleshoot if we ever break functionality to link this page
        console.assert(
            locationHook.state,
            `Component Edit() did not receive position data on load. Expected to receive a data object conforming to the shape of PositionIF in locationHook.state as returned by the uselocationHook() hook. Actual value received is <<${locationHook.state}>>. App will redirect to a page with generic functionality. Refer to Edit.tsx for troubleshooting. This is expected behavior should a user navigate to the '/trade/edit/:params' pathway any other way than clicking an in-app <Link/> element.`,
        );
        // IMPORTANT!! we must use this pathway, other implementations will not immediately
        // ... stop code in the rest of the file from running
        return <Navigate to={linkGenPool.getFullURL(params ?? '')} replace />;
    }

    const { position } = locationHook.state as { position: PositionIF };
    const poolIndex = position ? lookupChain(position.chainId).poolIndex : 0;
    const { posHashTruncated } = useProcessRange(position, crocEnv);
    const [newEditTransactionHash, setNewEditTransactionHash] = useState('');

    useEffect(() => {
        setCurrentRangeInEdit('');
        setNewEditTransactionHash('');
        if (position) {
            setCurrentRangeInEdit(position.positionId);
        }
    }, [position]);

    // eslint-disable-next-line
    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(
        getDefaultRangeWidthForTokenPair(
            position.chainId,
            position.base.toLowerCase(),
            position.quote.toLowerCase(),
        ),
    );

    const [concLiq, setConcLiq] = useState<bigint>(BigInt(0));

    const updateConcLiq = async () => {
        if (!crocEnv || !position) return;
        const pos = crocEnv.positions(
            position.base,
            position.quote,
            position.user,
        );

        const liquidity = (
            await pos.queryRangePos(position.bidTick, position.askTick)
        ).liq;

        setConcLiq(liquidity);
    };

    useEffect(() => {
        if (!crocEnv || !position) return;
        updateConcLiq();
    }, [crocEnv, lastBlockNumber, position?.positionId]);

    //  function mintArgsForEdit(
    //      lowTick: number,
    //      highTick: number,
    //  ): 'ambient' | [number, number] {
    //      if (lowTick === 0 && highTick === 0) {
    //          return 'ambient';
    //      } else {
    //          return [lowTick, highTick];
    //      }
    //  }

    interface EditPositionParams {
        setTxError: (s: Error | undefined) => void;
        resetConfirmation: () => void;
        setShowConfirmation: Dispatch<SetStateAction<boolean>>;
        defaultLowTick: number;
        defaultHighTick: number;
        slippageTolerancePercentage: number;
        setNewRangeTransactionHash: Dispatch<SetStateAction<string>>;
    }
    const sendEditTransaction = async (params: EditPositionParams) => {
        const {
            setTxError,
            resetConfirmation,
            setShowConfirmation,
            defaultLowTick: pinnedLowTick,
            defaultHighTick: pinnedHighTick,
            slippageTolerancePercentage,
            setNewRangeTransactionHash,
        } = params;

        if (!crocEnv || !position) return;
        let tx;
        setTxError(undefined);

        resetConfirmation();
        setShowConfirmation(true);

        const baseTokenDecimals = position?.baseDecimals || 18;
        const quoteTokenDecimals = position?.quoteDecimals || 18;

        try {
            const pool = crocEnv.pool(position.base, position.quote);
            const edit = new CrocEditPosition(
                pool,
                {
                    liquidity: concLiq,
                    burn: [position.bidTick, position.askTick],
                    mint: [pinnedLowTick, pinnedHighTick],
                },
                { impact: slippageTolerancePercentage / 100 },
            );
            tx = await edit.edit();
            setNewRangeTransactionHash(tx?.hash);
            setNewEditTransactionHash(tx?.hash);
            addPendingTx(tx?.hash);
            if (tx?.hash) {
                addTransactionByType({
                    userAddress: userAddress || '',
                    txHash: tx.hash,
                    txAction: 'Edit',
                    txType: 'Range',
                    txDescription: `Edit ${position.baseSymbol}+${position.quoteSymbol}`,
                    txDetails: {
                        baseAddress: position.base,
                        quoteAddress: position.quote,
                        poolIdx: poolIndex,
                        baseSymbol: position.baseSymbol,
                        quoteSymbol: position.quoteSymbol,
                        baseTokenDecimals: baseTokenDecimals,
                        quoteTokenDecimals: quoteTokenDecimals,
                        lowTick: pinnedLowTick,
                        highTick: pinnedHighTick,
                        gridSize: lookupChain(position.chainId).gridSize,
                        originalLowTick: position.bidTick,
                        originalHighTick: position.askTick,
                        isBid: position.positionLiqQuote === 0,
                    },
                });
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: tx.hash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
            }
            // We want the user to exit themselves
            // navigate(redirectPath, { replace: true });
        } catch (error) {
            console.error({ error });
            //  setTxError(error);
        }

        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (error) {
            console.error({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                IS_LOCAL_ENV && console.debug('repriced');
                removePendingTx(error.hash);
                const newTransactionHash = error.replacement.hash;
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                setNewRangeTransactionHash(newTransactionHash);
                const posHash = getPositionHash(position);
                addPositionUpdate({
                    txHash: newTransactionHash,
                    positionID: posHash,
                    isLimit: false,
                    unixTimeAdded: Math.floor(Date.now() / 1000),
                });
                IS_LOCAL_ENV && console.debug({ newTransactionHash });
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                receipt = error.receipt;
            }
        }
        if (receipt) {
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.hash);
        }
    };

    return (
        <>
            <div className={styles.repositionContainer}>
                <RepositionHeader
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    positionHash={posHashTruncated}
                    resetTxHash={() => setNewEditTransactionHash('')}
                    editPanel
                />

                <Range
                    isEditPanel
                    position={position}
                    prepopulatedBaseValue={position?.positionLiqBaseDecimalCorrected.toString()}
                    prepopulatedQuoteValue={position?.positionLiqQuoteDecimalCorrected.toString()}
                    editFunction={sendEditTransaction}
                    disableEditConfirmButton={
                        concLiq === BigInt(0) || newEditTransactionHash !== ''
                    }
                />
            </div>
        </>
    );
}

export default EditLiquidity;
