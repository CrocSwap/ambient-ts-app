import styles from './ClaimOrder.module.css';
import { useState, useEffect } from 'react';
import { useProcessOrder } from '../../utils/hooks/useProcessOrder';
import { ILimitOrderState } from '../../utils/state/graphDataSlice';
import { CircleLoaderFailed } from '../Global/LoadingAnimations/CircleLoader/CircleLoader';
import Button from '../Global/Button/Button';
import Animation from '../Global/Animation/Animation';
import completed from '../../assets/animations/completed.json';
import { FiExternalLink } from 'react-icons/fi';
import { formatAmount } from '../../utils/numbers';
import { CrocEnv } from '@crocswap-libs/sdk';
import { BigNumber } from 'ethers';
import Toggle2 from '../Global/Toggle/Toggle2';
import TooltipComponent from '../Global/TooltipComponent/TooltipComponent';

interface IClaimOrderProps {
    crocEnv: CrocEnv | undefined;
    limitOrder: ILimitOrderState;
    closeGlobalModal: () => void;
}

export default function ClaimOrder(props: IClaimOrderProps) {
    const { crocEnv, limitOrder, closeGlobalModal } = props;
    const {
        posLiqBaseDecimalCorrected,
        posLiqQuoteDecimalCorrected,
        // lowPriceDisplay,
        // highPriceDisplay,
        bidTick,
        askTick,
        // positionLiquidity,
        positionLiqTotalUSD,
        // userNameToDisplay,
        baseTokenSymbol,
        quoteTokenSymbol,
        isOrderFilled,
        isDenomBase,
        baseTokenLogo,
        quoteTokenLogo,
        usdValue,
        baseDisplayFrontend,
        quoteDisplayFrontend,
        baseDisplay,
        quoteDisplay,
    } = useProcessOrder(limitOrder);

    const [showConfirmation, setShowConfirmation] = useState(false);
    const [newClaimTransactionHash, setNewClaimTransactionHash] = useState('');
    const [txErrorCode, setTxErrorCode] = useState(0);
    const [txErrorMessage, setTxErrorMessage] = useState('');
    const [showSettings, setShowSettings] = useState(false);

    return <div>claim</div>;
}
