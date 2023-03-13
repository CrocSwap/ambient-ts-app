import React, { useState } from 'react';
// import Medal from '../../components/Global/Medal/Medal';
// import { MenuButton } from '../../components/Global/MenuButton/MenuButton';
// import PulseLoading from '../../components/Global/PulseLoading/PulseLoading';
import styles from './TestPage.module.css';
// import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';
// import { Steps, Hints } from 'intro.js-react';
import 'intro.js/introjs.css';
import { tosMethodsIF } from '../../App/hooks/useTermsOfService';
import { chartSettingsMethodsIF } from '../../App/hooks/useChartSettings';

interface TestPageProps {
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    togggggggleSidebar: () => void;
    walletToS: tosMethodsIF;
    chatToS: tosMethodsIF;
    chartSettings: chartSettingsMethodsIF;
}
// eslint-disable-next-line
export default function TestPage(props: TestPageProps) {
    // const { openGlobalModal, openSidebar, closeSidebar, togggggggleSidebar, walletToS, chatToS, chartSettings } = props;
    // const [isOpen, setOpen] = React.useState(false);

    // const exampleTest = (
    //     <div className={styles.example_container}>
    //         <h1>Please work</h1>
    //         <p>
    //             Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae perspiciatis
    //             veritatis necessitatibus quam eius ipsum illo cupiditate nobis dignissimos delectus
    //             quae quibusdam quas ratione ducimus laborum odio dolorum nesciunt, a natus provident
    //             vero quo voluptates dolore. Modi culpa id velit ipsa cumque corporis aut, aperiam,
    //             harum incidunt illo, repellat dolor blanditiis cum vitae perspiciatis eaque non quia
    //             quae. Porro vero odit dolorum at quae soluta atque, excepturi quod id, odio,
    //             repudiandae pariatur ipsum maiores? Minima nam sed ex nihil nostrum modi fuga nisi
    //             animi autem blanditiis iure a repudiandae voluptatibus eveniet odit, doloremque
    //             temporibus est incidunt molestias ratione ut. Reprehenderit!
    //         </p>
    //     </div>
    // );

    // const menuButtonStyle = {
    //     marginLeft: '2rem',
    // };
    // const steps = [
    //     {
    //         title: ' Welcome',
    //         intro: 'Welcome to react INTRO JS app',
    //     },
    //     {
    //         element: '.hello',
    //         title: 'first tutorual',
    //         intro: 'This is intro example',
    //         position: 'right',
    //         tooltipClass: 'myTooltipClass',
    //         highlightClass: 'myHighlightClass',
    //     },
    //     {
    //         element: '.tosText',
    //         title: 'second tutorual',
    //         intro: 'This is second example',
    //         position: 'right',
    //         tooltipClass: 'myTooltipClass',
    //         highlightClass: 'myHighlightClass',
    //     },
    // ];

    // const hints = [
    //     {
    //         element: '.hello',
    //         hint: 'Hello hint',
    //         hintPosition: 'middle-right',
    //     },
    // ];

    // const [tutorialEnabled, setTutorialEnabled] = useState(true);
    const [isReversed, setIsReversed] = useState(false);
    // const [hasChanged, setHasChanged] = useState(false)

    // function handleReveresedClick() {

    // }

    return (
        <section className={styles.main}>
            <div className={styles.rectangle}>{isReversed ? 10 : 20}</div>
            <button onClick={() => setIsReversed(!isReversed)}>Switch</button>
            <div className={styles.rectangle}>{!isReversed ? 10 : 20}</div>

            <div>
                <h1>has changed ? </h1>
            </div>
        </section>
    );
}
