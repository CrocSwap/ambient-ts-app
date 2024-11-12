import styles from './VaultRow.module.css';
import tempestLogoColor from './tempestLogoColor.svg';
// import tempestLogo from './tempestLogo.svg';
import { FlexContainer } from '../../../../styled/Common';
import { uriToHttp } from '../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../components/Global/TokenIcon/TokenIcon';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { VaultIF } from '../../../../ambient-utils/types';
import { TokenContext } from '../../../../contexts';
import { useContext } from 'react';

interface propsIF {
    idForDOM: string;
    vault: VaultIF;
}

export default function VaultRow(props: propsIF) {
    const { idForDOM, vault } = props;

    const { tokens } = useContext(TokenContext);

    const firstToken = tokens.getTokenByAddress(vault.token0Address);
    const secondToken = tokens.getTokenByAddress(vault.token1Address);

    if (!firstToken || !secondToken) {
        return null;
    }

    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const tokenIconsDisplay = (
        <FlexContainer alignItems='center' gap={5} style={{ flexShrink: 0 }}>
            <div className={styles.tempestDisplay}>
                <img src={tempestLogoColor} alt='tempest' />
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
            alignItems='flex-end'
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

    const vaultHeader = (
        <div className={styles.vaultHeader}>
            <span />
            <span className={styles.poolName}></span>
            <span>TVL</span>
            <span className={styles.depositContainer}>
                {showMobileVersion ? 'deposit' : 'My Deposit'}
            </span>
            <span className={styles.apyDisplay}>APY</span>
            <span className={styles.actionButtonContainer} />
        </div>
    );

    const randomNum = Math.floor(Math.random() * 100);
    const isEven = randomNum % 2 === 0;

    return (
        <div id={idForDOM} className={styles.mainContainer}>
            <div className={styles.contentColumn}>
                {vaultHeader}
                <div className={styles.mainContent}>
                    {tokenIconsDisplay}
                    <p className={styles.poolName}>
                        {firstToken.symbol} / {secondToken.symbol}
                    </p>
                    <p className={styles.tvlDisplay}>$100,000</p>
                    {depositsDisplay}
                    <p
                        className={styles.apyDisplay}
                        style={{ color: 'var(--other-green' }}
                    >
                        {`${vault.apr}%`}
                    </p>
                    <div className={styles.actionButtonContainer}>
                        <button className={styles.actionButton}>Deposit</button>
                        {isEven && (
                            <button className={styles.actionButton}>
                                Withdraw
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
