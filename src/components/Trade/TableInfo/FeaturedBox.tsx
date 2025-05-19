import { ZeroAddress } from 'ethers';
import React, { useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import {
    getBlockExplorerUrl,
    trimString,
    uriToHttp,
} from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { AppStateContext } from '../../../contexts/AppStateContext';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import {
    BoxContainer,
    BoxInfoText,
    FeaturedBoxInfoContainer,
    FeaturedBoxInnerContainer,
    FlexCenter,
    InfoHeader,
    TokenName,
    TokenSymbol,
} from './TableInfo.styles';

interface FeaturedBoxPropsIF {
    token: TokenIF;
    balance?: string;
    value?: string;
    pooled?: string;
    style?: React.CSSProperties | undefined;
    isInit?: boolean;
}

export function FeaturedBox(props: FeaturedBoxPropsIF) {
    const { token, balance, value, pooled, style, isInit } = props;
    const {
        activeNetwork: {
            chainId,
            chainSpec: { addrs },
        },
    } = useContext(AppStateContext);
    const blockExplorer = getBlockExplorerUrl(chainId);

    const [_, copy] = useCopyToClipboard();

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    function handleCopyAddress() {
        copy(token.address);
        openSnackbar(`${token.address} copied`, 'info');
    }

    return (
        <BoxContainer style={style} isInit={isInit}>
            <FeaturedBoxInnerContainer>
                <FlexCenter>
                    <TokenIcon
                        token={token}
                        src={token.logoURI ? uriToHttp(token.logoURI) : ''}
                        alt={token.symbol}
                        size={isInit ? '2xl' : '3xl'}
                    />
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                    <TokenName>{token.name}</TokenName>
                </FlexCenter>
                <FlexCenter style={{ gap: '8px' }}>
                    <InfoHeader>
                        {trimString(token.address, 5, 6, '…')}
                    </InfoHeader>
                    <IconWithTooltip
                        title={
                            token.address === 'ZERO_ADDRESS'
                                ? 'Copy the zero address (Ambient convention) to clipboard'
                                : `Copy ${token.symbol} address to clipboard`
                        }
                        placement='bottom'
                        enterDelay='1000'
                    >
                        <FiCopy
                            size={16}
                            className='icon_hover'
                            onClick={handleCopyAddress}
                        />
                    </IconWithTooltip>
                    <IconWithTooltip
                        title='View on Block Explorer'
                        placement='bottom'
                        enterDelay='1000'
                    >
                        <a
                            href={
                                token.address === ZeroAddress
                                    ? `${blockExplorer}address/${addrs.dex}`
                                    : `${blockExplorer}token/${token.address}`
                            }
                            target='_blank'
                            rel='noreferrer'
                        >
                            <FiExternalLink />
                        </a>
                    </IconWithTooltip>
                </FlexCenter>

                {isInit && (
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Pooled</InfoHeader>
                        <BoxInfoText>{pooled}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                )}

                {!isInit && (
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Balance</InfoHeader>
                        <BoxInfoText>{balance}</BoxInfoText>
                    </FeaturedBoxInfoContainer>
                )}
                {!isInit && (
                    <FeaturedBoxInfoContainer>
                        <InfoHeader>Value</InfoHeader>
                        <BoxInfoText>
                            {`${value ? `$${value}` : '...'}`}
                        </BoxInfoText>
                    </FeaturedBoxInfoContainer>
                )}
            </FeaturedBoxInnerContainer>
        </BoxContainer>
    );
}
