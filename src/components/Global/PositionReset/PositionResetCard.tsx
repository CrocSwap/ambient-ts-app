// import { CrocEnv } from '@crocswap-libs/sdk';
import { Skeleton } from '@mui/material';
import { FlexContainer, GridContainer, Text } from '../../../styled/Common';
import uriToHttp from '../../../utils/functions/uriToHttp';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { useProcessRange } from '../../../utils/hooks/useProcessRange';
import { PositionIF } from '../../../utils/interfaces/PositionIF';
import TokenIcon from '../TokenIcon/TokenIcon';

import styled from 'styled-components';
// import { IS_LOCAL_ENV } from '../../../constants';
// import { dispatch } from 'd3';
// import { addPendingTx, addPositionPendingUpdate, addReceipt, addTransactionByType, removePendingTx, removePositionPendingUpdate, updateTransactionHash } from '../../../utils/state/receiptDataSlice';
// import { TransactionError, isTransactionFailedError, isTransactionReplacedError } from '../../../utils/TransactionError';
// import { isStablePair } from '../../../utils/data/stablePairs';
// import { useContext, useState } from 'react';
// import { CrocEnvContext } from '../../../contexts/CrocEnvContext';
// import { UserPreferenceContext } from '../../../contexts/UserPreferenceContext';
// import { lookupChain } from '@crocswap-libs/sdk/dist/context';

const ResetButton = styled.div`
    cursor: pointer;
    height: 23px;
    line-height: var(--body-lh);
    font-size: var(--body-size);
    white-space: nowrap;
    padding: 5px 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--accent1);
    border: 1px solid var(--accent1);
    border-radius: 50px;
    transition: all var(--animation-speed) ease-in-out;
    z-index: 2;

    &:hover {
        color: var(--dark1);
        background: var(--accent1);
    }
`;
// Fill in first 3 position and call harvest function.

interface PositionResetCardIF {
    position: PositionIF;
    isLoading: boolean;
}

export default function PositionResetCard(props: PositionResetCardIF) {
    const { position, isLoading } = props;
    const { addressCurrent: userAddress } = useAppSelector(
        (state) => state.userData,
    );
    const shouldInvertDisplay = false;
    const tradeData = useAppSelector((state) => state.tradeData);

    const {
        quoteTokenLogo,
        baseTokenLogo,
        baseTokenSymbol,
        quoteTokenSymbol,
        ambientOrMin,
        ambientOrMax,
        // baseTokenAddress,
        // quoteTokenAddress,
    } = useProcessRange(position, userAddress);
    const tokenA = shouldInvertDisplay ? tradeData.tokenB : tradeData.tokenA;
    const tokenB = !shouldInvertDisplay ? tradeData.tokenB : tradeData.tokenA;

    // const {
    //     crocEnv,
    //     provider,
    //     chainData: { chainId, poolIndex },
    //     ethMainnetUsdPrice,
    // } = useContext(CrocEnvContext);

    // const { mintSlippage, dexBalRange } = useContext(UserPreferenceContext);

    // const isPairStable: boolean = isStablePair(
    //     baseTokenAddress,
    //     quoteTokenAddress,
    //     chainId,
    // );

    // const persistedSlippage: number = isPairStable
    //     ? mintSlippage.stable
    //     : mintSlippage.volatile;

    //     const [showConfirmation, setShowConfirmation] = useState(false);
    //     const [newTransactionHash, setNewTransactionHash] = useState('');
    //     const [txErrorCode, setTxErrorCode] = useState('');

    const tokensDisplay = (
        <FlexContainer gap={8} flexDirection='row'>
            <TokenIcon
                token={tokenA}
                size='2xl'
                src={uriToHttp(baseTokenLogo)}
                alt={baseTokenSymbol}
            />
            <TokenIcon
                token={tokenB}
                size='2xl'
                src={uriToHttp(quoteTokenLogo)}
                alt={quoteTokenSymbol}
            />
        </FlexContainer>
    );

    if (isLoading)
        return (
            <Skeleton
                variant='rectangular'
                width={'100%'}
                height={40}
                sx={{ bgcolor: 'var(--dark2)' }}
                animation='wave'
            />
        );

    return (
        <GridContainer
            gap={8}
            customCols='80px 127px 63.5px 63.5px 48px'
            style={{ alignItems: 'center' }}
        >
            {tokensDisplay}

            <Text
                tabIndex={0}
                fontWeight='300'
                color='text1'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'center',
                }}
            >
                {`${baseTokenSymbol} / ${quoteTokenSymbol}`}
            </Text>
            <Text
                tabIndex={0}
                fontWeight='300'
                color='accent5'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'end',
                }}
            >
                {ambientOrMin}
            </Text>
            <Text
                tabIndex={0}
                fontWeight='300'
                color='accent5'
                style={{
                    fontSize: 'var(--body-size)',
                    lineHeight: 'var(--body-lh)',
                    textAlign: 'end',
                }}
            >
                {ambientOrMax}
            </Text>
            <ResetButton>Reset</ResetButton>
        </GridContainer>
    );
}
