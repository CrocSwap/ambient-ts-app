import { Provider } from '@ethersproject/providers';
import { TopPool } from '../constants/networks/TopPool';
import { TokenIF } from './token/TokenIF';

export interface NetworkIF {
  chainId: string;
  graphCacheUrl: string;
  wagmiChain: any;
  shouldPollBlock: boolean;
  marketData: string;
  defaultPair: TokenIF[];
  topPools: TopPool[];
  getGasPriceInGwei: (provider?: Provider) => Promise<number | undefined>;
}
