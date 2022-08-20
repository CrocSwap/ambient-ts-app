import { useTermsOfService } from '../../App/hooks/useTermsOfService';

export default function TestPage() {
    useTermsOfService();

    return (
        <main>
            <h1>Hi there!</h1>
        </main>
    );
}
