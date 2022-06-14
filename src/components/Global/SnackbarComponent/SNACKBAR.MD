# Introduction

This directory contains code to create snackbars in the Ambient app and data to fill out the snackbar skeleton.

The snackbar component makes use of two components from MaterialUi. `Snackbar` and `Alert`. The `Alert` component is responsible for rendering a different variant message based on success rate and the `Snackbar` component is responsible for displaying the snackbar itself.

To read more on the component, see the official docs: 
Snackbar : https://mui.com/material-ui/react-snackbar/
Alert: https://mui.com/material-ui/react-alert/

# Location and Files

* This directory is located at `/src/components/SnackbarComponent/SnackbarComponent`
* `SnackbarComponent.tsx` contains:
    * JSX for the snackbar skeleton
    * code to handle optional `<children>` amd `<variant>` elements
* `SnackbarComponent.component.css` is a CSS component which holds styling for the snackbar skeleton.

# Developer Notes

To call a Snackbar anywhere in the app, you should:
1. Import the React functional component from `SnackbarComponent.tsx`
2. Import the `.ts` file housing the data for the snackbar you want to create
3. Import the `useState` hook from react
4. Create a local state in the file you want to call the snackbar in with a default boolean of `false`.
Ex: `const [openSnackbar, setOpenSnackbar] = useState<boolean>(false)`
5. Call the Snackbar component in your return statement and assign it a prop of `setOpenSnackbar` and `openSnackbar`. 
6. Give the SnackbarComponent a prop for severity. You have the option between `error`, `warning`, `info`, `success`. The default is success. 
7. The snackbar component takes content to render as a child component.
Full example of usablity:
` <SnackbarComponent severity='success' setOpenSnackbar={setOpenSnackbar} openSnackbar={openSnackbar}>
    I am snackbar
</SnackbarComponent>` 

To open the snackbar component, create a function that toggles the `SetOpenSnackbar` to `true`. To test the snackbar out, I suggest you create a button with an onclick that handles this functionality.





