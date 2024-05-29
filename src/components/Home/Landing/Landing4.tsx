import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
// import orderImage from '../../../assets/images/home/orders.png';
// import expandVideo from '../../../assets/images/home/expandable.mp4';
import InfinitelyExpandable from './AnimatedSvgs/InfinitelyExpandable';
export default function Landing4() {
    function getScreenHeight(): number {
        return window.innerHeight;
    }

    console.log(getScreenHeight());
    return (
        <div className={styles.sub_container}>
            <h2>
                Infinitely <span>Expandable</span>
            </h2>

            <div className={styles.sub_container_grid}>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Porro similique error accusantium earum ea facilis enim vel
                    nesciunt accusamus aliquid!
                </p>
                <FlexContainer>
                    {/* <video muted={true} autoPlay={true} loop={true}>
                        <source src={expandVideo} type='video/mp4' />
                    </video> */}
                    <InfinitelyExpandable />
                </FlexContainer>
            </div>
        </div>
    );
}
