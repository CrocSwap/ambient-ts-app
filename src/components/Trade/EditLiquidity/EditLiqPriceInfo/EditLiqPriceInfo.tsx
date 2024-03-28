import { FlexContainer, Text } from '../../../../styled/Common';
import styles from './EditLiqPriceInfo.module.css';

export default function EditLiqPriceInfo() {
    return (
        <FlexContainer flexDirection='column'>
            <div className={styles.row_item_header}>
                <p />
                <Text color='text2'>Current</Text>
                <Text color='text2'>New</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>ETH</Text>
                <Text color='text2'>10.00</Text>
                <Text color='white'>15.00</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>USDC</Text>
                <Text color='text2'>1210.00</Text>
                <Text color='white'>1335.00</Text>
            </div>

            <span className={styles.divider} />

            <div className={styles.row_item}>
                <Text color='white'>Min Price</Text>
                <Text color='text2'>2000.0</Text>
                <Text color='white'>2102</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>Max Price</Text>
                <Text color='text2'>4000.00</Text>
                <Text color='white'>5022.00</Text>
            </div>

            <span className={styles.divider} />

            <div className={styles.row_item}>
                <Text color='white'>Value</Text>
                <Text color='text2'>$16,056</Text>
                <Text color='negative'>$16,923</Text>
            </div>

            <div className={styles.row_item}>
                <Text color='white'>Price Impact</Text>
                <p />
                <Text color='negative'>(1.56%)</Text>
            </div>
        </FlexContainer>
    );
}
