// START: Import React and Dongles
import { motion } from 'framer-motion';

// START: Import React Functional Components
import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitDenominationSwitch from '../../../components/Trade/Limit/LimitDenominationSwitch/LimitDenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';

// START: Import Local Files
import { useTradeData } from '../Trade';

export default function Limit() {
    const { tradeData } = useTradeData();
    console.log(tradeData);
    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.6 } }}
            data-testid={'limit'}
        >
            <ContentContainer isOnTradeRoute>
                <LimitHeader />
                <LimitDenominationSwitch />
                <DividerDark />
                <LimitCurrencyConverter />
                <LimitExtraInfo />
                <LimitButton />
            </ContentContainer>
        </motion.section>
    );
}
