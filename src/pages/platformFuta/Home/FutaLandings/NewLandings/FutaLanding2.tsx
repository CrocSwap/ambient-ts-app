import styles from './FutaLanding2.module.css'
import circleSvg from './Circle.svg'
export default function FutaLanding2() {
    
    return (
        <div className={styles.container}>
            <h3>/FAIR AUCTIONS</h3>
            <div className={styles.content}>

            <p>Tickers are auctioned over a set period.</p>
                <p>All participants in the winning bid get their token share at the same price.</p>
                <p>There is no way to snipe supply early, or any hidden supply.</p>

           <img src={circleSvg} alt="circle svg" />
            </div>
        </div>
    )
}