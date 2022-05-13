import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import { Signer } from 'ethers';

interface ISwapProps {
    provider: Signer;
}

export default function Swap(props: ISwapProps) {
    const { provider } = props;

    console.log({ provider });
    return (
        <main data-testid={'swap'}>
            <ContentContainer>
                <SwapHeader />
                <CurrencyConverter />
                <ExtraInfo />
                <SwapButton />
            </ContentContainer>
        </main>
    );
}
