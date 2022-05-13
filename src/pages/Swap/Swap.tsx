import PropTypes from 'prop-types';

import CurrencyConverter from '../../components/Swap/CurrencyConverter/CurrencyConverter';
import ExtraInfo from '../../components/Swap/ExtraInfo/ExtraInfo';
import ContentContainer from '../../components/Global/ContentContainer/ContentContainer';
import SwapHeader from '../../components/Swap/SwapHeader/SwapHeader';
import SwapButton from '../../components/Swap/SwapButton/SwapButton';
import { Signer } from 'ethers';

export default function Swap() {
    // const { prov } = props;
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

// Swap.propTypes = {
//     prov: PropTypes.any.isRequired
// }
