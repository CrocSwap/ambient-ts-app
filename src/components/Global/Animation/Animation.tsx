import Lottie from 'react-lottie-player';

interface AnimationProps {
    loop?: boolean;
    animData: Record<string, unknown>;
    width?: number | string;
    height?: number | string;
    speed?: number;
}

export default function Animation(props: AnimationProps) {
    const { loop, animData, width, height, speed } = props;

    const chosenWidth = width ? width : '100%';
    const chosenHeight = height ? height : '100%';

    return (
        <div className='animation'>
            <Lottie
                loop={loop}
                animationData={animData}
                play
                speed={speed ? speed : 1}
                style={{ width: chosenWidth, height: chosenHeight }}
            />
        </div>
    );
}
