export default function validateEmail (
    inputText: string
): [
    boolean,
    string
] {
    let isValid: boolean;
    let message: string;
    const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    // input is a valid email address
    if (regEx.test(inputText)) {
        isValid = true;
        message = 'Send Login Link';
    // user entered text which fails validation
    } else if (!regEx.test(inputText) && inputText !== '') {
        isValid = false;
        message = 'Invalid Email';
    // user did not input text
    } else if (inputText == '') {
        isValid = false;
        message = 'Invalid Email';
    // any other situation we have not anticipated
    } else {
        isValid = false;
        message = 'Invalid Email';
    }
    return [ isValid, message ];
};