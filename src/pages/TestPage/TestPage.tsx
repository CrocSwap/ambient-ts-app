import { useTermsOfService } from '../../App/hooks/useTermsOfService';

export default function TestPage() {
    const [tosText, agreeToS, rejectToS] = useTermsOfService();

    return (
        <main>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <button onClick={() => agreeToS(new Date().toISOString())}>
                Agree to ToS
            </button>
            <button onClick={() => rejectToS(new Date().toISOString())}>
                Reject ToS
            </button>
        </main>
    );
}
