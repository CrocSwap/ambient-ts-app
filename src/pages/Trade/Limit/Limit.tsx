import ContentContainer from '../../../components/Global/ContentContainer/ContentContainer';
import LimitButton from '../../../components/Trade/Limit/LimitButton/LimitButton';
import LimitCurrencyConverter from '../../../components/Trade/Limit/LimitCurrencyConverter/LimitCurrencyConverter';
import LimitDenominationSwitch from '../../../components/Trade/Limit/LimitDenominationSwitch/LimitDenominationSwitch';
import LimitExtraInfo from '../../../components/Trade/Limit/LimitExtraInfo/LimitExtraInfo';
import LimitHeader from '../../../components/Trade/Limit/LimitHeader/LimitHeader';
import { motion } from 'framer-motion';
import DividerDark from '../../../components/Global/DividerDark/DividerDark';

export default function Limit() {
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
