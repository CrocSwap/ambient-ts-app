import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitDenominationSwitch from '../../../components/Trade/Limit/LimitDenominationSwitch/LimitDenominationSwitch';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';

export default function Limit() {
    return (
        <section data-testid={'limit'}>
            <ContentContainer isOnTradeRoute>
                <LimitHeader />
                <LimitDenominationSwitch />
                <LimitCurrencyConverter />
            </ContentContainer>
        </section>
    );
}
