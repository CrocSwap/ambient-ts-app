import React from 'react';
import { useTermsOfService } from '../../App/hooks/useTermsOfService';
import Medal from '../../components/Global/Medal/Medal';
import { MenuButton } from '../../components/Global/MenuButton/MenuButton';
import PulseLoading from '../../components/Global/PulseLoading/PulseLoading';
import styles from './TestPage.module.css';
// import { useAppDispatch, useAppSelector } from '../../utils/hooks/reduxToolkit';

interface TestPageProps {
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    togggggggleSidebar: () => void;
}
export default function TestPage(props: TestPageProps) {
    const { openGlobalModal, openSidebar, closeSidebar, togggggggleSidebar } = props;
    const [isOpen, setOpen] = React.useState(false);

    const { tosText, agreement, agreementDate } = useTermsOfService();

    const exampleTest = (
        <div className={styles.example_container}>
            <h1>Please work</h1>
            <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae perspiciatis
                veritatis necessitatibus quam eius ipsum illo cupiditate nobis dignissimos delectus
                quae quibusdam quas ratione ducimus laborum odio dolorum nesciunt, a natus provident
                vero quo voluptates dolore. Modi culpa id velit ipsa cumque corporis aut, aperiam,
                harum incidunt illo, repellat dolor blanditiis cum vitae perspiciatis eaque non quia
                quae. Porro vero odit dolorum at quae soluta atque, excepturi quod id, odio,
                repudiandae pariatur ipsum maiores? Minima nam sed ex nihil nostrum modi fuga nisi
                animi autem blanditiis iure a repudiandae voluptatibus eveniet odit, doloremque
                temporibus est incidunt molestias ratione ut. Reprehenderit!
            </p>
        </div>
    );

    const menuButtonStyle = {
        marginLeft: '2rem',
    };

    return (
        <section className={styles.main}>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <p>
                You {agreement ? 'accepted' : 'rejected'} the Terms of Service on {agreementDate}
            </p>
            {/* <button onClick={() => acceptToS()}>Agree to ToS</button>
            <button onClick={() => rejectToS()}>Reject ToS</button> */}
            <button onClick={() => openGlobalModal(exampleTest, 'this is title')}>
                Test Modal
            </button>
            <button onClick={() => openSidebar()}>Open Sidebar</button>
            <button onClick={() => closeSidebar()}>Close Sidebar</button>
            <button onClick={() => togggggggleSidebar()}>Toggle Sidebar</button>
            I am here
            <MenuButton
                isOpen={isOpen}
                onClick={() => setOpen(!isOpen)}
                style={menuButtonStyle}
                width={24}
                height={24}
            />
            <MenuButton
                isOpen={isOpen}
                onClick={() => setOpen(!isOpen)}
                strokeWidth='4'
                color='#7371fc'
                transition={{ ease: 'easeOut', duration: 0.2 }}
                width='34'
                height='24'
                style={menuButtonStyle}
            />
            <Medal ranking={1} />
            <PulseLoading />
        </section>
    );
}
