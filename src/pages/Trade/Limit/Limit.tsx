import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitDenominationSwitch from '../../../components/Trade/Limit/LimitDenominationSwitch/LimitDenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';

export default function Limit() {
    return (
        <section data-testid={'limit'}>
            <ContentContainer isOnTradeRoute>
                <LimitHeader />
                <LimitDenominationSwitch />
                <LimitCurrencyConverter />
                <LimitExtraInfo />
                <LimitButton />
            </ContentContainer>
        </section>
    );
}
