import styles from './AdvancedPriceInfo.module.css';
import { TokenIF } from '../../../../../utils/interfaces/TokenIF';

interface AdvancedPriceInfoIF {
    tokenPair: {
        dataTokenA: TokenIF;
        dataTokenB: TokenIF;
    };
}

export default function AdvancedPriceInfo(props: AdvancedPriceInfoIF) {
    const { tokenPair } = props;
    console.log(tokenPair);

    const currentPrice = (
        <>
            <div className={styles.price_info_row}>
                <span>Current Price</span>
                <span>2,800</span>
            </div>
            <div className={styles.price_info_row}>
                <span>Est.APY</span>
                <span className='primary_apy'>35.68%</span>
            </div>
        </>
    );

    const tableHead = (
        <thead>
            <tr>
                <th></th>
                <th>Current</th>
                <th>Repositioned To</th>
            </tr>
        </thead>
    );

    const balanceData = (
        <>
            <tr>
                <td data-column='Target: '>ETH Balance</td>
                <td data-column='Current'>0.00</td>
                <td data-column='Repositioned To'>0.69</td>
            </tr>
            <tr>
                <td data-column='Target: '>USDC Balance</td>
                <td data-column='Current'>1,000.0</td>
                <td data-column='Repositioned To'>500.0</td>
            </tr>
        </>
    );

    const rangeData = (
        <>
            <tr>
                <td data-column='Target: '>Range Upper Limit</td>
                <td data-column='Current'>2,000.0</td>
                <td data-column='Repositioned To'>2,1210.0</td>
            </tr>
            <tr>
                <td data-column='Target: '>Range Lower Limit</td>
                <td data-column='Current'>1,000.0</td>
                <td data-column='Repositioned To'>3,200.0</td>
            </tr>
        </>
    );

    const tableContents = (
        <div className={styles.advanced_table_display}>
            <table>
                {tableHead}
                <tbody>
                    {balanceData}
                    {rangeData}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={styles.price_info_container}>
            <div className={styles.price_info_content}>
                {currentPrice}
                {tableContents}
            </div>
        </div>
    );
}
