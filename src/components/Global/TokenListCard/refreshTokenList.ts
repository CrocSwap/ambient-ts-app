import uriToHttp from '../../../utils/functions/uriToHttp'; 

export default function refreshTokenList(uri:string) {
    console.log('user clicked button to refresh: ', uriToHttp(uri));
}