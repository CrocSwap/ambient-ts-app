import { useEffect, useState } from 'react';

export const useTermsOfService = () => {
    const [ userData, setUserData ] = useState(JSON.parse(localStorage.getItem('user') as string));
    const [ userAgreement, setUserAgreement ] = useState(userData?.termsOfService);
    useEffect(() => {
        function getUserData() {
            localStorage.user
                ? setUserData(JSON.parse(localStorage.getItem('user') as string))
                : getUserData();
        }
        getUserData();
    }, []);
    useEffect(() => {
        userData && setUserAgreement(userData.termsOfService);
    }, [userData]);
    useEffect(() => console.log(userAgreement), [userAgreement]);
}