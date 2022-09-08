import React from 'react';
import { useTermsOfService } from '../../App/hooks/useTermsOfService';
import styles from './TestPage.module.css';

interface TestPageProps {
    openGlobalModal: (content: React.ReactNode) => void;
}
export default function TestPage(props: TestPageProps) {
    const { tosText, agreement, agreementDate, acceptToS, rejectToS } = useTermsOfService();

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

    return (
        <main className={styles.main}>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <p>
                You {agreement ? 'accepted' : 'rejected'} the Terms of Service on {agreementDate}
            </p>
            <button onClick={() => acceptToS()}>Agree to ToS</button>
            <button onClick={() => rejectToS()}>Reject ToS</button>
            <button onClick={() => props.openGlobalModal('demo')}>open modal</button>
            <button onClick={() => props.openGlobalModal('example2')}>open example 2</button>
            <button onClick={() => props.openGlobalModal('example4')}>open example 4</button>
            <button onClick={() => props.openGlobalModal(exampleTest)}>Another one</button>
        </main>
    );
}
