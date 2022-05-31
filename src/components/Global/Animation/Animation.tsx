import Lottie from 'react-lottie-player';

interface AnimationProps {
    loop?: boolean;
    animData: object;
    width?: number | string;
    height?: number | string;
}

export default function Animation(props: AnimationProps) {
    const { loop, animData, width, height } = props;

    const chosenWidth = width ? width : '100%';
    const chosenHeight = height ? height : '100%';

    return (
        <div className='animation'>
            <Lottie
                loop={loop}
                animationData={animData}
                play
                speed={1}
                style={{ width: chosenWidth, height: chosenHeight }}
            />
        </div>
    );
}
