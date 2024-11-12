import styles from './VaultRow.module.css';
import tempestLogoColor from './tempestLogoColor.svg';
import tempestLogo from './tempestLogo.svg';
import { FlexContainer } from '../../../../styled/Common';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';

export default function VaultRow() {
    const firstToken = {
        address: '0x3211dFB6c2d3F7f15D7568049a86a38fcF1b00D3',
        chainId: 11155111,
        decimals: 18,
        fromList: '/ambient-token-list.json',
        listedBy: ['/ambient-token-list.json'],
        logoURI: 'https://ambient.finance/zcat_32.png',
        name: 'ZirCat',
        symbol: 'ZCAT',
    };

    const secondToken = {
        address: '0x0000000000000000000000000000000000000000',
        chainId: 11155111,
        decimals: 18,
        fromList: '/ambient-token-list.json',
        listedBy: ['/ambient-token-list.json'],
        logoURI:
            'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        name: 'Native Ether',
        symbol: 'ETH',
    };
    const showMobileVersion = useMediaQuery('(max-width: 768px)');


    const tokenIconsDisplay = (
        <FlexContainer alignItems='center' gap={5} style={{ flexShrink: 0 }}>
            <div className={styles.tempestDisplay}>
                <img src={tempestLogo} alt='tempest' />
            </div>
            <TokenIcon
                token={firstToken}
                src={uriToHttp(firstToken.logoURI)}
                alt={firstToken.symbol}
                size={showMobileVersion ? 'm' : '2xl'}
            />
            <TokenIcon
                token={secondToken}
                src={uriToHttp(secondToken.logoURI)}
                alt={secondToken.symbol}
                size={showMobileVersion ? 'm' : '2xl'}
            />
        </FlexContainer>
    );

    const depositsDisplay = (
        <FlexContainer
            alignItems='center'
            flexDirection='column'
            justifyContent='flex-end'
            gap={5}
            style={{ flexShrink: 0 }}
            className={styles.depositContainer}
        >
            <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                1,000
                <TokenIcon
                    token={firstToken}
                    src={uriToHttp(firstToken.logoURI)}
                    alt={firstToken.symbol}
                    size={'m'}
                />
            </FlexContainer>
            <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                1,000
                <TokenIcon
                    token={secondToken}
                    src={uriToHttp(secondToken.logoURI)}
                    alt={secondToken.symbol}
                    size={'m'}
                />
            </FlexContainer>
        </FlexContainer>
    );



    return (
        <div className={styles.mainContainer}>
            <div className={styles.mainContent}>
                {tokenIconsDisplay}
                <p className={styles.poolName}>ETH / USDC</p>
                <p className={styles.tvlDisplay}>$1,000,000.00</p>
                {depositsDisplay}
                <p className={styles.apyDisplay} style={{ color: 'var(--other-green' }}>16.75%</p>
                <div className={styles.actionButtonContainer}>
                <button className={styles.actionButton}>Deposit</button>

                </div>
            </div>
        </div>
    );
}
