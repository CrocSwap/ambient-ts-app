import SnackbarComponent from '../../components/Global/SnackbarComponent/SnackbarComponent';
import { useState } from 'react';

export default function TestPage() {
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    return (
        <main>
            <button onClick={() => setOpenSnackbar(true)}>open me</button>
            <h3>This is TestPage.tsx</h3>
            <SnackbarComponent
                severity='success'
                setOpenSnackbar={setOpenSnackbar}
                openSnackbar={openSnackbar}
            >
                I am snackbar
            </SnackbarComponent>
        </main>
    );
}
