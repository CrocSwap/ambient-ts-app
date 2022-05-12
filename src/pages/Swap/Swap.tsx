import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';

export default function Swap() {
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
