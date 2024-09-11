import { CHAT_BACKEND_URL } from '../../ambient-utils/constants';
import { getUserAvatarEndpoint } from './ChatConstants/ChatEndpoints';

export const getAvatarRest = async (walletID: string) => {
    if (walletID && walletID.length > 0) {
        const response = await fetch(
            CHAT_BACKEND_URL + getUserAvatarEndpoint + '/' + walletID,
            {
                method: 'GET',
            },
        );
        const data = await response.json();
        return data;
    }
    return '';
};
