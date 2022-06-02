// START: Import React and Dongles
import { useMoralis } from 'react-moralis';
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
import { getCurrentTokens, findTokenByAddress } from '../../../utils/functions/processTokens';
import { kovanETH, kovanUSDC } from '../../../utils/data/defaultTokens';

export default function Limit() {
    const { tradeData } = useTradeData();

    // TODO:  @Emily the logic below to get token pair data was ported from Swap.tsx and
    // TODO:  ... will need to be repeated in Range.tsx per the current architecture, we
    // TODO:  ... should refactor this to have less redundancy in code and app processes

    const { chainId } = useMoralis();
    // get current tokens for the active chain
    // if called before Moralis can initialize use kovan
    const tokensBank = getCurrentTokens(chainId ?? '0x2a');

    const tokenPair = {
        dataTokenA: findTokenByAddress(tradeData.addressTokenA, tokensBank) ?? kovanETH,
        dataTokenB: findTokenByAddress(tradeData.addressTokenB, tokensBank) ?? kovanUSDC,
    };
    console.log(tokenPair);

    return (
        <motion.section
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            exit={{ x: window.innerWidth, transition: { duration: 0.6 } }}
            data-testid={'limit'}
        >
            <ContentContainer isOnTradeRoute>
                <LimitHeader tokenPair={tokenPair} />
                <LimitDenominationSwitch />
                <DividerDark />
                <LimitCurrencyConverter />
                <LimitExtraInfo />
                <LimitButton />
            </ContentContainer>
        </motion.section>
    );
}
