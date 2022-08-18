import { useState } from 'react';

export const useFavePools = () => {
    const userData = JSON.parse(localStorage.user);
    const [ favePools, setFavePools ] = useState(userData.favePools);

    const addPoolToFaves = () => {
        //  make a new array of all fave pools with new addition and expansion operator
        //  update local state with the new array
        setFavePools([]);
        // assign the value to userData.favePools and write to local storage
    }

    const removePoolFromFaves = () => {
        //  make a new array of all fave pools with pool removed via Array.filter()
        //  update local state with the new array
        setFavePools([]);
        // assign the value to userData.favePools and write to local storage
    }

    return [
        favePools,
        addPoolToFaves,
        removePoolFromFaves
    ];
}