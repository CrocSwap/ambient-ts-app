import { getFormattedNumber } from '../../../../ambient-utils/dataLayer';
import { TokenIF, TransactionIF } from '../../../../ambient-utils/types';
import { FlexContainer, Text } from '../../../../styled/Common';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import TokenIcon from '../../../Global/TokenIcon/TokenIcon';

interface propsIF {
    tx: TransactionIF;
    width: number;
    isAccountPage: boolean;
    isBase: boolean;
}

export default function TxToken(props: propsIF) {
    const { tx, width, isAccountPage } = props;

    const baseToken: TokenIF = Object.freeze({
        address: tx.base,
        decimals: tx.baseDecimals,
        name: tx.baseName,
        chainId: parseInt(tx.chainId),
        logoURI: tx.baseTokenLogoURI,
        symbol: tx.baseSymbol,
        fromList: 'from TransactionIF data do not reuse',
    });

    const quoteToken: TokenIF = Object.freeze({
        address: tx.quote,
        decimals: tx.quoteDecimals,
        name: tx.quoteName,
        chainId: parseInt(tx.chainId),
        logoURI: tx.quoteTokenLogoURI,
        symbol: tx.quoteSymbol,
        fromList: 'from TransactionIF data do not reuse',
    });

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const makeFlowDisplay = (flow: number): string => {
        const flowDisplay: string = getFormattedNumber({
            value: Math.abs(flow),
            zeroDisplay: '0',
        });
        const qtyDisplay: string =
        flowDisplay !== undefined ? `${flowDisplay || '0'}` : '…';
        return qtyDisplay;
    }

    return (
        <div
            style={{ width: width, display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}
            data-label={tx.baseSymbol}
            className='base_color'
            tabIndex={0}
        >
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                <Text fontSize='body'>{makeFlowDisplay(tx.baseFlowDecimalCorrected)}</Text>
                <DefaultTooltip
                    interactive
                    title={
                        <p>
                            {baseToken.symbol}
                            {baseToken.symbol === 'ETH' ? '' : ': ' + baseToken.symbol}
                        </p>
                    }
                    placement={'left'}
                    disableHoverListener={!isAccountPage}
                    arrow
                    enterDelay={750}
                    leaveDelay={0}
                >
                    <TokenIcon
                        token={baseToken}
                        src={baseToken.logoURI}
                        alt={baseToken.symbol}
                        size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
                    />
                </DefaultTooltip>
            </FlexContainer>
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                <Text fontSize='body'>{makeFlowDisplay(tx.quoteFlowDecimalCorrected)}</Text>
                <DefaultTooltip
                    interactive
                    title={
                        <p>
                            {quoteToken.symbol}
                            {quoteToken.symbol === 'ETH' ? '' : ': ' + quoteToken.symbol}
                        </p>
                    }
                    placement={'left'}
                    disableHoverListener={!isAccountPage}
                    arrow
                    enterDelay={750}
                    leaveDelay={0}
                >
                    <TokenIcon
                        token={quoteToken}
                        src={quoteToken.logoURI}
                        alt={quoteToken.symbol}
                        size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
                    />
                </DefaultTooltip>
            </FlexContainer>
        </div>
    );
}