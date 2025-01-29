import React, { useContext } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IS_LOCAL_ENV } from '../ambient-utils/constants';
import ChatPanel from '../components/Chat/ChatPanel';
import { ChainDataContext } from '../contexts';
import { CrocEnvContext } from '../contexts/CrocEnvContext';
import Accessibility from '../pages/common/Accessibility/Accessibility';
import FAQPoints from '../pages/common/FAQ/FAQPoints';
import NotFound from '../pages/common/NotFound/NotFound';
import PrivacyPolicy from '../pages/common/PrivacyPolicy/PrivacyPolicy';
import TermsOfService from '../pages/common/TermsOfService/TermsOfService';
import TestPage from '../pages/common/TestPage/TestPage';
import Explore from '../pages/platformAmbient/Explore/Explore';
import Home from '../pages/platformAmbient/Home/Home';
import ExampleForm from '../pages/platformAmbient/InitPool/FormExample';
import InitPool from '../pages/platformAmbient/InitPool/InitPool';
import Portfolio from '../pages/platformAmbient/Portfolio/Portfolio';
import Swap from '../pages/platformAmbient/Swap/Swap';
import Limit from '../pages/platformAmbient/Trade/Limit/Limit';
import Range from '../pages/platformAmbient/Trade/Range/Range';
import Reposition from '../pages/platformAmbient/Trade/Reposition/Reposition';
import TradeSwap from '../pages/platformAmbient/Trade/Swap/Swap';
import Trade from '../pages/platformAmbient/Trade/Trade';
import Vanity from '../pages/platformAmbient/Vanity/Vanity';
import NoVaults from '../pages/platformAmbient/Vaults/NoVaults';
import Vaults from '../pages/platformAmbient/Vaults/Vaults';

const PlatformAmbientRoutes: React.FC = () => {
    const { defaultUrlParams } = useContext(CrocEnvContext);
    const { isVaultSupportedOnNetwork } = useContext(ChainDataContext);

    return (
        <Routes>
            <Route index element={<Home />} />
            <Route path='accessibility' element={<Accessibility />} />
            <Route path='trade' element={<Trade />}>
                <Route
                    path=''
                    element={<Navigate replace to={defaultUrlParams.market} />}
                />
                <Route
                    path='market/:params'
                    element={<TradeSwap isOnTradeRoute={true} />}
                />

                <Route path='limit/:params' element={<Limit />} />

                <Route path='pool/:params' element={<Range />} />
                <Route path='reposition/:params' element={<Reposition />} />
                <Route
                    path='edit/'
                    element={<Navigate to={defaultUrlParams.pool} replace />}
                />
            </Route>
            <Route
                path='trade/market'
                element={<Navigate to={defaultUrlParams.market} replace />}
            />
            <Route
                path='trade/limit'
                element={<Navigate to={defaultUrlParams.limit} replace />}
            />
            <Route
                path='trade/pool'
                element={<Navigate to={defaultUrlParams.pool} replace />}
            />
            <Route
                path='trade/reposition'
                element={<Navigate to={defaultUrlParams.pool} replace />}
            />
            <Route
                path='chat'
                element={<ChatPanel isFullScreen={true} appPage={true} />}
            />
            <Route
                path='chat/:params'
                element={<ChatPanel isFullScreen={true} appPage={true} />}
            />
            <Route path='initpool/:params' element={<InitPool />} />
            <Route path='account' element={<Portfolio />} />
            <Route
                path='vaults'
                element={isVaultSupportedOnNetwork ? <Vaults /> : <NoVaults />}
            />
            <Route
                path='xp-leaderboard'
                element={<Portfolio isLevelsPage isRanksPage />}
            />
            <Route
                path='account/transactions'
                element={<Portfolio specificTab='transactions' />}
            />
            <Route
                path='account/limits'
                element={<Portfolio specificTab='limits' />}
            />
            <Route
                path='account/liquidity'
                element={<Portfolio specificTab='liquidity' />}
            />
            <Route
                path='account/points'
                element={<Portfolio specificTab='points' />}
            />
            <Route
                path='account/exchange-balances'
                element={<Portfolio specificTab='exchange-balances' />}
            />
            <Route
                path='account/wallet-balances'
                element={<Portfolio specificTab='wallet-balances' />}
            />
            <Route path='account/xp' element={<Portfolio isLevelsPage />} />
            <Route
                path='account/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
            <Route path='account/:address' element={<Portfolio />} />
            <Route
                path='account/:address/transactions'
                element={<Portfolio specificTab='transactions' />}
            />
            <Route
                path='account/:address/limits'
                element={<Portfolio specificTab='limits' />}
            />
            <Route
                path='account/:address/liquidity'
                element={<Portfolio specificTab='liquidity' />}
            />
            <Route
                path='account/:address/points'
                element={<Portfolio specificTab='points' />}
            />
            <Route
                path='account/:address/exchange-balances'
                element={<Portfolio specificTab='exchange-balances' />}
            />
            <Route
                path='account/:address/wallet-balances'
                element={<Portfolio specificTab='wallet-balances' />}
            />
            <Route
                path='account/:address/xp'
                element={<Portfolio isLevelsPage />}
            />
            <Route
                path='account/:address/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
            <Route path='/:address' element={<Portfolio />} />
            <Route
                path='/:address/transactions'
                element={<Portfolio specificTab='transactions' />}
            />
            <Route
                path='/:address/limits'
                element={<Portfolio specificTab='limits' />}
            />
            <Route
                path='/:address/liquidity'
                element={<Portfolio specificTab='liquidity' />}
            />
            <Route
                path='/:address/points'
                element={<Portfolio specificTab='points' />}
            />
            <Route
                path='/:address/exchange-balances'
                element={<Portfolio specificTab='exchange-balances' />}
            />
            <Route
                path='/:address/wallet-balances'
                element={<Portfolio specificTab='wallet-balances' />}
            />
            <Route path='/:address/xp' element={<Portfolio isLevelsPage />} />
            <Route
                path='/:address/xp/history'
                element={<Portfolio isLevelsPage isViewMoreActive />}
            />
            <Route
                path='swap'
                element={<Navigate to={defaultUrlParams.swap} replace />}
            />
            {/* refactor EXPLORE as a nested route */}
            <Route
                path='explore'
                element={<Navigate to='/explore/pools' replace />}
            />
            <Route path='explore/pools' element={<Explore view='pools' />} />
            <Route path='explore/tokens' element={<Explore view='tokens' />} />
            <Route path='swap/:params' element={<Swap />} />
            <Route path='terms' element={<TermsOfService />} />
            <Route path='privacy' element={<PrivacyPolicy />} />
            <Route path='faq' element={<Navigate to='/faq/points' replace />} />
            <Route path='faq/points' element={<FAQPoints />} />
            <Route path='/v/:params' element={<Vanity />} />
            <Route path='/vanity/:params' element={<Vanity />} />
            <Route path='/l/:params' element={<Vanity />} />
            <Route path='/link/:params' element={<Vanity />} />
            <Route path='faq/points/:params' element={<FAQPoints />} />
            <Route path='/v/:params' element={<Vanity />} />
            {IS_LOCAL_ENV && <Route path='testpage' element={<TestPage />} />}
            {IS_LOCAL_ENV && (
                <Route path='template/form' element={<ExampleForm />} />
            )}
            <Route path='/404' element={<NotFound />} />
            <Route path='*' element={<Navigate to='/404' replace />} />
        </Routes>
    );
};

export default PlatformAmbientRoutes;
