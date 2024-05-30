import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
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
                    <InfinitelyExpandable />
                </FlexContainer>
            </div>
        </div>
    );
}
