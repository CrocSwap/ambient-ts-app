import styles from './FutaLanding5.module.css'
import circleSvg from './Circle.svg'
import { Link } from 'react-router-dom'
export default function FutaLanding5() {
    
    return (
        <div className={styles.container}>
            <h3>/LINKS</h3>
            <div className={styles.content}>

            <Link to='/twitter'>X Profile</Link>
            <Link to='/twitter'>Discord communication</Link>
            <Link to='/twitter'>Documentation</Link>
            <Link to='/twitter'>Brand Kit</Link>
           
            </div>
        </div>
    )
}