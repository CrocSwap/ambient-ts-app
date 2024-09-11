// START: Import React and Dongles
import { useContext, useEffect, useState } from 'react';
import { useLocation, useParams, Navigate } from 'react-router-dom';

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

function EditLiquidity() {
    const { params } = useParams();
    const { crocEnv } = useContext(CrocEnvContext);

    const { getDefaultRangeWidthForTokenPair } = useContext(TradeDataContext);
    const { setCurrentRangeInEdit } = useContext(RangeContext);
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
    const { posHashTruncated } = useProcessRange(position, crocEnv);
    useEffect(() => {
        setCurrentRangeInEdit('');
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
    // eslint-disable-next-line
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

                <Range
                    isEditPanel
                    position={position}
                    prepopulatedBaseValue={position?.positionLiqBaseDecimalCorrected.toString()}
                    prepopulatedQuoteValue={position?.positionLiqQuoteDecimalCorrected.toString()}
                />
            </div>
        </>
    );
}

export default EditLiquidity;
