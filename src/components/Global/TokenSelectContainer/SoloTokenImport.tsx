import { useContext } from 'react';
import styled from 'styled-components';
import { uriToHttp } from '../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../ambient-utils/types';
import { AppStateContext } from '../../../contexts';
import { FlexContainer } from '../../../styled/Common';
import Button from '../../Form/Button';
import DividerDark from '../DividerDark/DividerDark';
import TokenIcon from '../TokenIcon/TokenIcon';
interface propsIF {
    customToken: TokenIF | null | 'querying';
    chooseToken: (tkn: TokenIF, isCustom: boolean) => void;
    chainId: string;
}

export const MainContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;

    p {
        color: var(--text2);
        font-size: var(--body-size);
        line-height: var(--body-lh);
    }
`;

export const TokenDisplay = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: space-between;

    h2 {
        font-size: var(--header2-size);
        line-height: var(--header2-lh);
        color: var(--text1);
    }

    h6 {
        text-align: right;
    }
`;

export default function SoloTokenImport(props: propsIF) {
    const { customToken, chooseToken } = props;

    const {
        activeNetwork: { blockExplorer },
    } = useContext(AppStateContext);

    const tokenNotFound = (
        <FlexContainer
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
        >
            <p>Could not find matching token</p>
        </FlexContainer>
    );

    const tokenQuerying = (
        <FlexContainer
            justifyContent='center'
            alignItems='center'
            textAlign='center'
            style={{ width: '100%', padding: '4px 0' }}
        >
            <p>...</p>
        </FlexContainer>
    );

    if (!customToken) return tokenNotFound;
    if (customToken === 'querying') return tokenQuerying;

    return (
        <MainContainer>
            <p style={{ textAlign: 'center' }}>
                A match for this token was found on chain.
            </p>
            <DividerDark />

            <TokenDisplay>
                <FlexContainer alignItems='center' gap={8}>
                    <TokenIcon
                        token={customToken}
                        src={uriToHttp(customToken.logoURI)}
                        alt={customToken.symbol}
                        size='2xl'
                    />
                    <h2>{customToken?.symbol}</h2>
                </FlexContainer>
                <h6>{customToken?.name}</h6>
            </TokenDisplay>
            <p style={{ textAlign: 'center' }}>
                This token is not listed on Coingecko or any other major
                reputable lists. Please be sure
                <a
                    href={blockExplorer + 'token/' + customToken.address}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                        color: 'var(--accent2)',
                    }}
                    aria-label={customToken.symbol}
                >
                    {' '}
                    this{' '}
                </a>
                is the actual token you want to trade. Many fraudulent tokens
                will use the same name and symbol as other major tokens. Always
                conduct your own research before trading.
            </p>
            <FlexContainer justifyContent='center'>
                <Button
                    idForDOM='import_unknown_token_button'
                    flat
                    title='Acknowledge'
                    action={() => chooseToken(customToken, true)}
                />
            </FlexContainer>
        </MainContainer>
    );
}
