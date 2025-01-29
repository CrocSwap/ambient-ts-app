import { Hints, Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { Dispatch, SetStateAction } from 'react';
// import{ MdOutlineArrowForwardIos, MdOutlineArrowBackIos, MdClose} from 'react-icons/md'

interface TutorialOverlayPropsIF {
    isTutorialEnabled: boolean;
    setIsTutorialEnabled: Dispatch<SetStateAction<boolean>>;
    // eslint-disable-next-line
    steps: any;
}
export default function TutorialOverlay(props: TutorialOverlayPropsIF) {
    const { isTutorialEnabled, setIsTutorialEnabled, steps } = props;

    const hints = [
        {
            element: '.hello',
            hint: 'Hello hint',
            hintPosition: 'middle-right',
        },
    ];

    return (
        <>
            <Steps
                enabled={isTutorialEnabled}
                steps={steps}
                initialStep={0}
                onExit={() => setIsTutorialEnabled(false)}
                // options={{
                //     nextLabel: '>',
                //     prevLabel: '<',
                //     skipLabel : <MdClose color='#CDC1FF' size={25}/>
                // }}
            />
            <Hints enabled={true} hints={hints} />
        </>
    );
}
