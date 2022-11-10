import styles from './TopRangesCard.module.css';
import { BsFillCheckCircleFill } from 'react-icons/bs';
interface TopRangesCardProp {
    number: number;
    searchInput?: string;
}
export default function TopRangesCard(props: TopRangesCardProp) {
    const { searchInput } = props;
    return (
        <div className={styles.container}>
            <div>{props.number}</div>
            <div className={styles.token_info}>
                <div>
                    <img
                        src={
                            'https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/1024/Ethereum-ETH-icon.png'
                        }
                        alt=''
                        width='25px'
                    />
                    <img
                        src={'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png'}
                        alt=''
                        width='25px'
                    />
                </div>
                <p>{searchInput ? searchInput : 'DAI'}/USDC</p>
                <p>0.01%</p>
            </div>

            <div>BenWoslki.eth</div>
            <div>324f..232x</div>
            <div>0.0021</div>
            <div>1.2332</div>

            <div>1.21e-8</div>
            <div>1.60e-5</div>
            <div>0.09%</div>
            <div>
                <BsFillCheckCircleFill size={25} />
            </div>
        </div>
    );
}
