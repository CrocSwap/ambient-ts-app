import styled from 'styled-components';

interface TokenNameData {
    token0: string;
    token1: string;
}

const PoolDisplayContainer = styled.section`
    display: none;
    color: rgba(235, 235, 255, 0.4);

    @media only screen and (min-width: 768px) {
        font-size: 10px;
        line-height: 13px;
    }

    @media only screen and (min-width: 1200px) {
        display: flex;
        font-size: 12px;
        line-height: 16px;
    }
`;

export default function PoolDisplay(props: TokenNameData) {
    return (
        <PoolDisplayContainer>
            {props.token0}/{props.token1}
        </PoolDisplayContainer>
    );
}
