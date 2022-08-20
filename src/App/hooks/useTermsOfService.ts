import { useEffect, useState } from 'react';

export const useTermsOfService = (): [
    string,
    (date: string) => void
] => {
    const [ userData, setUserData ] = useState(JSON.parse(localStorage.getItem('user') as string));
    const [ agreement, setAgreement ] = useState(userData?.termsOfService?.agreed);
    const [ agreementDate, setAgreementDate ] = useState(userData?.termsOfService?.date);
    useEffect(() => {
        function getUserData() {
            localStorage.user
                ? setUserData(JSON.parse(localStorage.getItem('user') as string))
                : setTimeout(() => getUserData(), 500);
        }
        getUserData();
    }, []);
    useEffect(() => {
        userData && setAgreement(userData.termsOfService);
    }, [userData]);
    useEffect(() => console.log(agreement), [agreement]);

    const tosText = 'Doug will have to put something here.'

    const agreeToS = (date: string) => {
        const details = {
            agreed: true,
            date: date
        }
        setAgreement(details.agreed);
        setAgreementDate(details.date);
        const newUserData = userData;
        newUserData.termsOfService = details;
        localStorage.setItem('user', JSON.stringify(newUserData));
    }

    return [tosText, agreeToS];
}