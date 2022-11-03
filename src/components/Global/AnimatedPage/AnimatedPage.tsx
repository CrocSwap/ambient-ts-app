import { motion } from 'framer-motion';

// const pageVariants = {
//     in: {
//         opacity: 1,
//         y: 0,
//     },
//     out: {
//         opacity: 0,
//         y: '-100vh',
//     },
// };
const animations = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
};

// const pageVariant3D = {
//     initial: {
//         opacity: 0,
//         x: '-100vw',
//         scale: 0.8,
//     },
//     in: {
//         opacity: 1,
//         x: 0,
//         scale: 1,
//     },
//     out: {
//         opacity: 0,
//         x: '-100vw',
//         scale: 1.2,
//     },
// };

// const pageTransition = {
//     type: 'tween',
//     ease: 'anticipate',
//     duration: 1,
// };

// to do left to right, change y to x and 100vh to 100vw. Make sure you add a high zindex to sidebar so it stays above the animation.

// you might also need to add  an overflowX of hidden to the main app css to stop it from showing a scrollbar during animations

interface AnimatedPageProps {
    children: React.ReactNode;
}
const AnimatedPage = (props: AnimatedPageProps) => {
    return (
        <motion.div
            variants={animations}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={{ duration: 0.3 }}

            // initial='initial'
            // animate='in'
            // exit='out'
            // variants={pageVariant3D}
            // transition={pageTransition}
        >
            {props.children}
        </motion.div>
    );
};

export default AnimatedPage;
