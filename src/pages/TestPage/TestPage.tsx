import { useTermsOfService } from '../../App/hooks/useTermsOfService';
import Pagination from '../../components/Global/Pagination/Pagination';
import styles from './TestPage.module.css';
export default function TestPage() {
    const { tosText, agreement, agreementDate, acceptToS, rejectToS } = useTermsOfService();

    return (
        <main className={styles.main}>
            <h1>Hi there!</h1>
            <p>{tosText}</p>
            <p>
                You {agreement ? 'accepted' : 'rejected'} the Terms of Service on {agreementDate}
            </p>
            <button onClick={() => acceptToS()}>Agree to ToS</button>
            <button onClick={() => rejectToS()}>Reject ToS</button>
            <Pagination
                currentPage={4}
                postsPerPage={10}
                totalPosts={100}
                paginate={(pageNumber: number) => console.log(pageNumber)}
            />
        </main>
    );
}
