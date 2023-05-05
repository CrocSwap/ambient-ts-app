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

The snackbar has been updated to be a global component (like globalModal and globalPopup). It can be accessed via the `appStateContext` and passing in `content` and `severity` into the `open` function. 
