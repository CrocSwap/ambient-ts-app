import { useTermsOfService } from '../../App/hooks/useTermsOfService';

export default function TestPage() {
    const [
        tosText,
        agreement,
        agreementDate,
        agreeToS,
        rejectToS
    ] = useTermsOfService();

    return (
        <main>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <p>You {agreement ? 'accepted' : 'rejected'} the Terms of Service on {agreementDate}</p>
            <button onClick={() => agreeToS()}>
                Agree to ToS
            </button>
            <button onClick={() => rejectToS(new Date().toISOString())}>
                Reject ToS
            </button>
        </main>
    );
}
