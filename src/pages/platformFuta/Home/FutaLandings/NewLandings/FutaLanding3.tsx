import styles from './FutaLanding3.module.css'
import circleSvg from './Circle.svg'
export default function FutaLanding3() {
    
    return (
        <div className={styles.container}>
            <h3>/UNIQUE TICKERS</h3>
            <div className={styles.content}>

            <p>There can only ever be 1 of each ticker.</p>
                <p>No more confusion over which is the “right” token.</p>

           <img src={circleSvg} alt="circle svg" />
            </div>
        </div>
    )
}