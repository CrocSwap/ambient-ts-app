import { useMoralis } from 'react-moralis';

export const useWallet = () => {
    console.log('called hook useWallet');
    const {
        // authenticate,
        // isAuthenticated,
        // isWeb3Enabled,
        // isWeb3EnableLoading,
        // enableWeb3,
        // account,
        // logout,
        user,
    } = useMoralis();
    console.log(JSON.stringify(user));
};
