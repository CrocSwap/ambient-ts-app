import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
import orderImage from '../../../assets/images/home/orders.png';

export default function Landing4() {
    return (
        <div className={styles.sub_container}>
            <h2>Bridge the Gap Between Trading and LP’ing</h2>

            <div className={styles.sub_container_grid}>
                <FlexContainer flexDirection='column' gap={16}>
                    <p>
                        Make your LP position a trading position – and vice
                        versa – using our range and limit orders.{' '}
                    </p>

                    <p>
                        Make your LP position a trading position – and vice
                        versa – using our range and limit orders.
                    </p>
                </FlexContainer>
                <FlexContainer justifyContent='flex-end'>
                    <img
                        src={orderImage}
                        alt='Range and Limit Order'
                        width='40%'
                    />
                </FlexContainer>
            </div>
        </div>
    );
}
