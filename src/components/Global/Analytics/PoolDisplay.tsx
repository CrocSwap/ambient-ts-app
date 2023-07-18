import { PoolDisplayContainer } from './Analytics.styles';
interface TokenNameData {
    token0: string;
    token1: string;
}

export default function PoolDisplay(props: TokenNameData) {
    return (
        <PoolDisplayContainer>
            {props.token0}/{props.token1}
        </PoolDisplayContainer>
    );
}
