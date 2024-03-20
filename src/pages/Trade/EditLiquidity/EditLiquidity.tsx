// START: Import React and Dongles
import { useContext, useEffect, useMemo, useState, memo } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';
import { CrocReposition, toDisplayPrice } from '@crocswap-libs/sdk';

// START: Import Other Local Files
import styles from './EditLiquidity.module.css';
import { PositionIF, PositionServerIF } from '../../../ambient-utils/types';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { CachedDataContext } from '../../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
import { TokenContext } from '../../../contexts/TokenContext';
import { ReceiptContext } from '../../../contexts/ReceiptContext';
import { UserDataContext } from '../../../contexts/UserDataContext';
import { useModal } from '../../../components/Global/Modal/useModal';
import { linkGenMethodsIF, useLinkGen } from '../../../utils/hooks/useLinkGen';
import { RangeContext } from '../../../contexts/RangeContext';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { ChainDataContext } from '../../../contexts/ChainDataContext';
import RepositionHeader from '../../../components/Trade/Reposition/RepositionHeader/RepositionHeader';
import { TradeDataContext } from '../../../contexts/TradeDataContext';

function EditLiquidity() {
    const { params } = useParams();
    const {
        cachedQuerySpotPrice,
        cachedFetchTokenPrice,
        cachedTokenDetails,
        cachedEnsResolve,
    } = useContext(CachedDataContext);
    const {
        crocEnv,
        activeNetwork,
        provider,
        ethMainnetUsdPrice,
        chainData: { blockExplorer },
    } = useContext(CrocEnvContext);
    const { tokens } = useContext(TokenContext);
    const {
        gasPriceInGwei,
        lastBlockNumber,
        isActiveNetworkBlast,
        isActiveNetworkScroll,
    } = useContext(ChainDataContext);
    const { bypassConfirmRepo, repoSlippage } = useContext(
        UserPreferenceContext,
    );
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        addPositionUpdate,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const {
        isDenomBase,
        tokenA,
        tokenB,
        isTokenABase,
        poolPriceNonDisplay: currentPoolPriceNonDisplay,
        getDefaultRangeWidthForTokenPair,
    } = useContext(TradeDataContext);
    const {
        simpleRangeWidth,
        setSimpleRangeWidth,
        setMaxRangePrice: setMaxPrice,
        setMinRangePrice: setMinPrice,
        setCurrentRangeInReposition,
        setRescaleRangeBoundariesWithSlider,
        setAdvancedMode,
    } = useContext(RangeContext);
    const { userAddress } = useContext(UserDataContext);

    const [isOpen, openModal, closeModal] = useModal();

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
    const { posHashTruncated } = useProcessRange(position);

    const [rangeWidthPercentage, setRangeWidthPercentage] = useState(
        getDefaultRangeWidthForTokenPair(
            position.chainId,
            position.base.toLowerCase(),
            position.quote.toLowerCase(),
        ),
    );
    const [newEditTransactionHash, setNewEditTransactionHash] = useState('');

    return (
        <>
            <div className={styles.repositionContainer}>
                <RepositionHeader
                    setRangeWidthPercentage={setRangeWidthPercentage}
                    positionHash={posHashTruncated}
                    resetTxHash={() => setNewEditTransactionHash('')}
                    editPanel
                />
                <p>use trade module skeleton</p>
                <h1>EDIT TOKEN INPUT</h1>
                <h1>EDIT BOUNDS</h1>
                <h1>EDIT EXTRA INFO</h1>
            </div>
        </>
    );
}

export default EditLiquidity;
