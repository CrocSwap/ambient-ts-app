# Introduction

This directory houses all page-level React functional components for the Ambient UI.

# About

In normal React architecture, JSX files are generally written as pages or components to achieve separation of concerns and to make JSX elements reusable. While there is no functional difference between a React function coding for a page vs a component, "pages" are generally top-level files which import one or more components.

Each sub-directory in this directory contains the `.tsx` file encoding a top-level page file which maps to a single URL pathway (either absolute or defined with parameters). In the future we may use a site architecture by which a single page file is rendered at multiple URL pathways but initilize differently at each.

# Location and Files

-   This file `PAGES.md` is located in the directory `/src/pages`
-   The `/Home` sub-directory contains all files necessary to render the `Home()` React function which maps to the index URL pathway
-   The `/Trade` sub-directory contains all files necessary to render the `Trade()` React function which maps to the `index/trade` URL pathway
-   The `/Analytics` sub-directory contains all files necessary to render the `Analytics()` React function which maps to the `index/analytics` URL pathway
-   The `/Portfolio` sub-directory contains all files necessary to render the `Portfolio()` React function which maps to the `index/account` URL pathway
