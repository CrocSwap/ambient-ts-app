import styles from './SetPoolFees.module.css';
import { motion } from 'framer-motion';

interface SetPoolFeesPropsIF {
    animation: {
        initial: {
            opacity: number;
            x: number;
        };
        animate: {
            opacity: number;
            x: number;
        };
        exit: {
            opacity: number;
            x: number;
        };
    };
}
export default function SetPoolFees(props: SetPoolFeesPropsIF) {
    const { animation } = props;

    console.log(animation);
    return (
        <motion.div
            variants={animation}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.2 }}
        >
            <h1>SET POOL FEES</h1>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Cum necessitatibus suscipit
            iusto et officiis nisi sapiente facere recusandae neque sint quis dignissimos cupiditate
            omnis praesentium earum veniam, ea fugiat repellat unde molestiae possimus, minus libero
            consequatur. Eveniet est animi vero tempore reiciendis odit et, ab consequatur
            aspernatur amet quod eaque?
        </motion.div>
    );
}
