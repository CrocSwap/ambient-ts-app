import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
// import orderImage from '../../../assets/images/home/orders.png';
import compound from '../../../assets/images/home/autoCompoundCropped.mp4';
export default function Landing7() {
    function getScreenHeight(): number {
        return window.innerHeight;
    }

    console.log(getScreenHeight());
    return (
        <div className={styles.sub_container}>
            <h2>
                Auto- <span>Compounding</span>
            </h2>

            <div className={styles.sub_container_grid}>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Porro similique error accusantium earum ea facilis enim vel
                    nesciunt accusamus aliquid!
                </p>
                <FlexContainer justifyContent='flex-end' alignItems='flex-end'>
                    <video muted={true} autoPlay={true} loop={true}>
                        <source src={compound} type='video/mp4' />
                    </video>
                </FlexContainer>
            </div>
        </div>
    );
}
