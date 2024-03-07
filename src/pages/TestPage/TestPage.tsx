import { ZERO_ADDRESS } from '../../ambient-utils/constants';
// import HarvestPositionInfo from '../../components/RangeActionModal/RangeActionInfo/HarvestPositionInfo';
import RemoveRangeInfo from '../../components/RangeActionModal/RangeActionInfo/RemoveRangeInfo';

export default function TestPage() {
    return (
        // <HarvestPositionInfo
        //     baseTokenSymbol='ETH'
        //     quoteTokenSymbol='USDC'
        //     fiatHarvestNum={`$ ${27}`}
        //     baseTokenLogoURI='https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
        //     quoteTokenLogoURI='https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png'
        //     baseHarvestNum={undefined}
        //     quoteHarvestNum={undefined}
        //     baseTokenAddress={ZERO_ADDRESS}
        //     quoteTokenAddress='0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'
        // />
        <RemoveRangeInfo
            baseTokenAddress={ZERO_ADDRESS}
            quoteTokenAddress='0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C'
            baseTokenSymbol='ETH'
            quoteTokenSymbol='USDC'
            baseTokenLogoURI='https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
            quoteTokenLogoURI='https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png'
            posLiqBaseDecimalCorrected={11}
            posLiqQuoteDecimalCorrected={12}
            feeLiqBaseDecimalCorrected={13}
            feeLiqQuoteDecimalCorrected={14}
            removalPercentage={55}
            baseRemovalNum={18}
            quoteRemovalNum={19}
            fiatRemovalVal={`$ ${73}`}
            isAmbient={true}
        />
    );
}
