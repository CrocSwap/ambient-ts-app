import styled from 'styled-components/macro';

interface TokenProps {
    token0: string | false;
    token1: string | false;
}

const TokenDisplayContainer = styled.section`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;

    img {
        width: 12.5px;

        @media only screen and (min-width: 1200px) {
            width: 22.5px;
        }
    }
`;

// this is something we would want globally with more styling options(similar to NextJs)
const Image = styled.img`
    width: 100%;
`;

export default function TokenDisplay(props: TokenProps) {
    const baseTokenSrc = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${props.token0}/logo.png`;
    const quoteTokenSrc = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${props.token1}/logo.png`;

    return (
        <TokenDisplayContainer>
            <Image src={baseTokenSrc} />
            {props.token1 && <Image src={quoteTokenSrc} />}
        </TokenDisplayContainer>
    );
}
