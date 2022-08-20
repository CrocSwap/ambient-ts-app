import { useTermsOfService } from '../../App/hooks/useTermsOfService';

export default function TestPage() {
    const [tosText] = useTermsOfService();

    return (
        <main>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
        </main>
    );
}
