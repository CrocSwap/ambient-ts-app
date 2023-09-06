import { useContext } from 'react';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { AppStateContext } from '../../../contexts/AppStateContext';
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
import TokenIcon from '../../Global/TokenIcon/TokenIcon';
import IconWithTooltip from '../../Global/IconWithTooltip/IconWithTooltip';
import trimString from '../../../utils/functions/trimString';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { ZERO_ADDRESS } from '../../../constants';
import { getChainExplorer } from '../../../utils/data/chains';
import { CrocEnvContext } from '../../../contexts/CrocEnvContext';

interface FeaturedBoxPropsIF {
    token: TokenIF;
    balance: string;
    value: string;
}
export function FeaturedBox(props: FeaturedBoxPropsIF) {
    const { token, balance, value } = props;
    const {
        chainData: { chainId, addrs },
    } = useContext(CrocEnvContext);
    const blockExplorer = getChainExplorer(chainId);

    const [_, copy] = useCopyToClipboard();

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    function handleCopyAddress() {
        copy(token.address);
        openSnackbar(`${token.address} copied`, 'info');
    }
    return (
        <BoxContainer>
            <FeaturedBoxInnerContainer>
                <FlexCenter>
                    <TokenIcon token={token} size={'3xl'} />
                    <TokenSymbol>{token.symbol}</TokenSymbol>
                    <TokenName>{token.name}</TokenName>
                </FlexCenter>
                <FlexCenter style={{ gap: '8px' }}>
                    <InfoHeader>
                        {trimString(token.address, 5, 6, '…')}
                    </InfoHeader>
                    <IconWithTooltip
                        title='Copy transaction hash to clipboard'
                        placement='bottom'
                    >
                        <FiCopy
                            size={16}
                            color='var(--text3)'
                            className='icon_hover'
                            onClick={handleCopyAddress}
                        />
                    </IconWithTooltip>
                    <IconWithTooltip
                        title='View on Block Explorer'
                        placement='bottom'
                    >
                        <a
                            href={
                                token.address === ZERO_ADDRESS
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
                <FeaturedBoxInfoContainer>
                    <InfoHeader>Balance</InfoHeader>
                    <BoxInfoText>{balance}</BoxInfoText>
                </FeaturedBoxInfoContainer>
                <FeaturedBoxInfoContainer>
                    <InfoHeader>Value</InfoHeader>
                    <BoxInfoText>${value}</BoxInfoText>
                </FeaturedBoxInfoContainer>
            </FeaturedBoxInnerContainer>
        </BoxContainer>
    );
}
