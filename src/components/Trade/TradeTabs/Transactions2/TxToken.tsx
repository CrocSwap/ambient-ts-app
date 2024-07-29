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
    const { tx, width, isAccountPage, isBase } = props;

    const token: TokenIF = Object.freeze(
        isBase
            ? {
                  address: tx.base,
                  decimals: tx.baseDecimals,
                  name: tx.baseName,
                  chainId: parseInt(tx.chainId),
                  logoURI: tx.baseTokenLogoURI,
                  symbol: tx.baseSymbol,
                  fromList: 'from TransactionIF data do not reuse',
              }
            : {
                  address: tx.quote,
                  decimals: tx.quoteDecimals,
                  name: tx.quoteName,
                  chainId: parseInt(tx.chainId),
                  logoURI: tx.quoteTokenLogoURI,
                  symbol: tx.quoteSymbol,
                  fromList: 'from TransactionIF data do not reuse',
              },
    );

    const phoneScreen = useMediaQuery('(max-width: 600px)');
    const smallScreen = useMediaQuery('(max-width: 720px)');

    const flowDisplay: string = getFormattedNumber({
        value: Math.abs(
            isBase ? tx.baseFlowDecimalCorrected : tx.quoteFlowDecimalCorrected,
        ),
        zeroDisplay: '0',
    });
    const qtyDisplay =
        flowDisplay !== undefined ? `${flowDisplay || '0'}` : '…';

    return (
        <div
            style={{ width: width }}
            data-label={tx.baseSymbol}
            className='base_color'
            tabIndex={0}
        >
            <FlexContainer
                alignItems='center'
                justifyContent='flex-end'
                gap={4}
            >
                <Text fontSize='body'>{qtyDisplay}</Text>
                <DefaultTooltip
                    interactive
                    title={
                        <p>
                            {token.symbol}
                            {token.symbol === 'ETH' ? '' : ': ' + token.symbol}
                        </p>
                    }
                    placement={'left'}
                    disableHoverListener={!isAccountPage}
                    arrow
                    enterDelay={750}
                    leaveDelay={0}
                >
                    <TokenIcon
                        token={token}
                        src={token.logoURI}
                        alt={token.symbol}
                        size={phoneScreen ? 'xxs' : smallScreen ? 'xs' : 'm'}
                    />
                </DefaultTooltip>
            </FlexContainer>
        </div>
    );
}
