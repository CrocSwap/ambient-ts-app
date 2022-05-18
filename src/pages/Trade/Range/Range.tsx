import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import RangeButton from '../../../components/Trade/Range/RangeButton/RangeButton';
import RangeCurrencyConverter from '../../../components/Trade/Range/RangeCurrencyConverter/RangeCurrencyConverter';
import RangePriceInfo from '../../../components/Trade/Range/RangePriceInfo/RangePriceInfo';
import RangeWidth from '../../../components/Trade/Range/RangeWidth/RangeWidth';

export default function Range() {
    return (
        <section data-testid={'range'}>
            <ContentContainer>
                <RangeCurrencyConverter />
                <RangeWidth />
                <RangePriceInfo />
                <RangeButton />
            </ContentContainer>
        </section>
    );
}
