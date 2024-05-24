import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
// import orderImage from '../../../assets/images/home/orders.png';
import expandVideo from '../../../assets/images/home/expandable.mp4';
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
                <FlexContainer justifyContent='flex-end' alignItems='flex-end'>
                    <video muted={true} autoPlay={true} loop={true}>
                        <source src={expandVideo} type='video/mp4' />
                    </video>
                </FlexContainer>
            </div>
        </div>
    );
}

// <div className={styles.sub_container}>
//     <h2>Bridge the Gap Between Trading and LP’ing</h2>

//     <div className={styles.sub_container_grid}>
//         <FlexContainer flexDirection='column' gap={16}>
//             <p>
//                 Make your LP position a trading position – and vice
//                 versa – using our range and limit orders.{' '}
//             </p>

//             <p>
//                 Make your LP position a trading position – and vice
//                 versa – using our range and limit orders.
//             </p>
//         </FlexContainer>
//         <FlexContainer justifyContent='flex-end'>
//             <img
//                 src={orderImage}
//                 alt='Range and Limit Order'
//                 width='40%'
//             />
//         </FlexContainer>
//     </div>
// </div>
