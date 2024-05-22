import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
import tradeImage from '../../../assets/images/home/trade.svg';

export default function Landing2() {
    return (
        <div className={styles.sub_container}>
            <h2>
                A <span>new generation</span> DEX
            </h2>

            <div className={styles.sub_container_grid}>
                <FlexContainer
                    flexDirection='column'
                    justifyContent='space-between'
                    gap={16}
                >
                    <FlexContainer flexDirection='column'>
                        <h2>Faster</h2>
                        <h2>Easier</h2>
                        <h2>Cheaper</h2>
                    </FlexContainer>
                    <p>
                        Ambient runs the entire DEX inside a single smart
                        contract, allowing for low fee transactions, greater
                        liquidity rewards, and a fairer trading experience.
                    </p>
                </FlexContainer>
                <img src={tradeImage} alt='' />
            </div>
        </div>
    );
}
