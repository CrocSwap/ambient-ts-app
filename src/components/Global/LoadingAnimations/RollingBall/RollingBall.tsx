import styles from './RollingBall.module.css';
import { motion } from 'framer-motion';

interface RollingBallProps {
    ballSize: string;
}
export default function RollingBall(props: RollingBallProps) {
    return (
        <div className={styles.loader}>
            {/* CLICK ME!!! */}

            <>
                <motion.div
                    className={styles.ball_container}
                    animate={{
                        rotate: 360,
                        borderRadius: ['50% 50%', '45% 50%'],
                        x: 100,
                        backgroundColor: ['#7371FC', '#CDC1FF'],
                    }}
                    initial={{
                        x: 0,
                    }}
                    transition={{
                        flip: Infinity,
                        duration: 2,
                        ease: 'easeInOut',
                    }}
                    style={{
                        height: props.ballSize,
                        background: '#E81B63',
                        width: props.ballSize,
                        borderRadius: '45% 50%',
                    }}
                ></motion.div>
            </>
        </div>
    );
}
