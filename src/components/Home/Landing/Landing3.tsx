import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
import liquidityImage from '../../../assets/images/home/liquidity.svg';
import liquidityVideo from '../../../assets/images/home/liquidity.mp4';

export default function Landing3() {
    return (
        <div className={styles.sub_container}>
            <h2>Deep, Diversified Liquidity</h2>

            <div className={styles.sub_container_grid}>
                <FlexContainer
                    flexDirection='column'
                    justifyContent='space-between'
                    gap={32}
                >
                    <p>
                        Ambient is built for diversified, sustainable liquidity
                        that fixes the broken LP economics of AMMs.{' '}
                    </p>

                    <p>It is also the only DEX to support - </p>

                    <ul>
                        <li>concentrated (V3)</li>
                        <li>ambient (V2) </li>
                        <li>knock-out liquidity (Limit orders)</li>
                    </ul>

                    <p>in the same liquidity pool.</p>
                </FlexContainer>
                <FlexContainer justifyContent='flex-end' alignItems='flex-end'>
                    <video muted={true} autoPlay={true} loop={true}>
                        <source src={liquidityVideo} type='video/mp4' />
                    </video>
                </FlexContainer>
            </div>
        </div>
    );
}
