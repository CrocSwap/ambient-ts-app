

# Introduction
This is a guide documentation for TutorialComponent.

# TutorialStepIF 
This is the interface for tutorial steps. (which derived from intro.js Step interface to maintain compatibility)

| prop| definition  | type
|--|--|--|
| `element`| Dom selector element which will highlighted related step | string `{#element_id, .className etc..}`
| `title`| Title string for tooltip | string
| `intro`| Intro string for tooltip | string
| `actionTrigger?`| Action trigger for tooltip, this should be a dom selector element which will trigger action when related step is activated | string  `{#element_id, .className etc..}`
| `navigate?`| Navigate object for tooltip | { label: string, path: string }
| `actionOnComplete?`| Action to be triggered on complete, same approach with actionTrigger prop | string `{#element_id, .className etc..}`

```

        element: '#navbar_create',
        title: ' Welcome',
        intro: 'Welcome to Create Token on Futa',
        actionTrigger: '#create_auction_reset',

```




## Structure
```console
                  >> INFINITE SCROLL COMPONENT STRUCTURE <<

/*
                               ┌────────────────────────────────────────┐        
                               │                                        │        
┌──────────────────┐   ┌───────▼────────┐   ┌──────────────┐            │        
│ Transactions.tsx │   │   Orders.tsx   │   │  Ranges.tsx  │◄──────┐    │        
└──────────┬───────┘   └────────┬───────┘   └─┬────────────┘       │    │        
           │                    │             │                    │    │        
           │                    │             │                    │    │        
           │                    │             │                    │    │        
           │          ┌─────────▼─────────┐   │      ┌─────────────┼────┼─────┐  
           └─────────►│InfiniteScroll.tsx │◄──┘      │ useMergeWithPendingTxs │  
                      └──┬─────────────▲──┘          └──────────▲─────────────┘  
                         │             │                        │                
                         │             │             ┌──────────┼─────────┐      
                         │             │             │ useGenFakeTableRow │      
                         │             │             └────────────────────┘      
                         │             │                                         
                         │             │             ┌──────────────────────────┐
                         │             └─────────────┼ useInfiniteScrollFetchers│
                         │                           └──────────────────────────┘
          ┌──────────────▼──────────────┐                                        
          │ TableRowsInfiniteScroll.tsx │                                        
          └───────────────────┬─────────┘                                        
                       ┌──────┼─────────┐                                        
                       │  .module.css   │                                        
                       └────────────────┘                                        
 */

 ```

Infinite scroll is consists of 2 react components and 3 hooks.

The main component is **InfiniteScroll.tsx** which is injected into Transactions.tsx, Orders.tsx, and Ranges.tsx.


## Usage
Here is a sample injection on Transactions.tsx:

```tsx
      <InfiniteScroll
            type='Transaction'
            data={sortedTransactions}
            tableView={tableView}
            isAccountView={isAccountView}
            sortBy={sortBy}
            showAllData={showAllData}
            dataPerPage={50}
            fetchCount={50}
            targetCount={30}
            sortTransactions={sortData}
            txFetchType={fetchType}
            txFetchAddress={addressToUse}
            componentLock={infiniteScrollLock}
         />
```

Here are some critical props that are passed to InfiniteScroll.tsx:

| prop| definition  | type
|--|--|--|
| `type`| Type of data to be displayed.| string: `'Transaction'`  , `'Order'`  ,  `'Range'`
|`data`| Pivot data to be displayed, pagination and merging with pending data is handled in component| `TransactionIF[]`,  `LimitOrderIF[]` , `PositionIF[]`|
|`dataPerPage`|Count data on each page, pagination done according to that value|`number`
|`fetchCount`|Count of fetched data on each call, this parameter passed into fetcher methods|`number`
|`targetCount`|Target data count for each fetch, for Limits and Liquidity data, Infinite scroll will send extra requests until fulfill this amount of data to finish fetching process|`number`
|*`componentLock`*?|Used to lock infinite scroll auto fetcher and page skip mechanism in some cases. |`boolean`
|*`sortTransactions`*?| Sort method for TransactionIF list for case of usage in Transactions component|`(data:  TransactionIF[])  =>  TransactionIF[];`
*`txFetchType`*?|Fetch type for transactions component like PoolTxs, UserTxs, UserPoolTxs which used to call right fetcher endpoint (only used for Transactions component)|`TxFetchType`
*`txFetchAddress`*?|Address parameter for Transaction data fetching for UserTxs and UserPoolTxs cases|`0x${string}`  ,  `string`
*`sortOrders`*?|Sort method for LimitOrderIF list for case of usage in Limit component|`(data:  PositionIF[])  =>  PositionIF[];`
*`sortPositions`*?|Sort method for PositionIF list for case of usage in Liquidity component|`(data:  PositionIF[])  =>  PositionIF[]`

Other type of props like; `tableView`, `sortBy`, `isAccountView`, `showAllData` are directly sent into TableRows component.



## InfiniteScroll.tsx

This component manages the infinite scroll functionality. With help of **TableRowsInfiniteScroll** component, it manages the pagination and fetching process.
TableRowsInfiniteScroll component is detecting once user scrolls to the bottom and triggers InfiniteScroll's fetcher method named `addMoreData`


### Summary of filtering data to be displayed
```console

/*
    ┌───────────┐                                        
    │props.data │                                        
    └─────┬─────┘                                        
          │       ◄─────────────┐                        
          │                     │                        
┌─────────▼──────────┐          │                        
│fetchedTransactions │       ┌────────────────┐          
└─────────┬───────┬──┘       │addMoreData() * │          
          │       │          └────────────────┘          
          │       └──────────────►                       
          │                                              
    ┌─────▼──────┐          ┌───────────────────────────┐
    │ mergedData │◄───────  │useMergeWithPendingTxs     │
    └─────┬──────┘          │                           │
          │                 │to add pending txs if      │
          │                 │there are some pending txs │
                            └───────────────────────────┘
 slice array with indices                                
 which calculated from                                   
pagesVisible, pageDataCounts                             
          │                                              
  ┌─────────────────┐                                    
  │ ┌─────▼───────┐ │                                    
  │ │dataToDisplay│ │                                    
  │ └─────────────┘ │                                    
  └─────────────────┘                                    
 */

```   

This is the flow of how rendered data is built with processes.

- props.data is pivotData for InfiniteScroll component.
- That list will be extended with new fetched data on each scroll. And keeped as `fetchedTransactions` state variable.
- If pivot data is updated with new transactions it will be merged in that component with `hotTransactions` state variable.
- This data also merged with useMergeWithPendingTxs hook to add pending transactions to data (which are created by user but not indexed yet)
- At the last step, dataToDisplay is calculated by slicing fetchedTransactions list according to pagesVisible and pageDataCounts variables.
- Then its rendered on `TableRowsInfiniteScroll` component.

`TableRowsInfiniteScroll` component is responsible for rendering data and detecting user scrolled to very bottom on table to trigger data fetching/shifting down or shifting up to get previous page

### Variables
Here are some critical state variables which are used in InfiniteScroll component

| State Variable | Definition |Type
|--|--|--|
fetchedTransactions| Holds table data, once new data fetched it will be merged with previous data, Also this list will merged with new added transactions from parent component, And at last step that list is merging with pending transactions data| `TransactionIF[]`,`LİmitOrderIF[]`, `PositionIF[]`
hotTransactions| Holds new added transactions in cases when user not at first page, once user backs to page 1, this list will be merged with fetchedTransactions | `TransactionIF[]`,`LİmitOrderIF[]`, `PositionIF[]`
pagesVisible| Indicates which pages are visible to user, It is keeps two numbers, first one is start page, second one is end page, Once user fetches new data, these two numbers will be incremented by one, so User will see new page data with current end page data| `number[]`
pageDataCount| Keeps count of data on each page, After fetcher method gets required amount of data, it will add that count to this array, so once InfiniteScroll component filters data for related pages, it will calculate slice indices according to this array| `number[]`
extraPagesAvailable| Indicates user already fetched a page's data or not. That variable is used in TableRowsInfiniteScroll component to detect user already fetched a page's data or not, according to that check it will trigger **shiftDown** or **addMoreData** method| `number`
moreDataAvailable| Indicates more data may available on server side, If user scrolls to bottom and this variable is true, InfiniteScroll will trigger **addMoreData** method, once infinite scroll decides that there is no more data available, it will set this variable to false so that fetchers will not be triggered again| `boolean`
extraRequestCreditCount| Is used for sending extra fetch requests until fulfill required amount of data for a table page. Especially used on Orders and Liquidity components, The request limit can be controlled with **EXTRA_REQUEST_CREDIT_COUNT** variable in component. Also can be overrided by parent component with  **extraRequestCreditLimit** prop| `number`
requestedOldestTimes| Holds sent oldestTimeParameters which sent to backend to not trigger redundant same time parameter requests| `number[]`


### Methods
Here are some critical methods which are used in InfiniteScroll component

`addMoreData` (byPassPageIncrement?: boolean)<br />This method is used to fetch data from backend once user scrolls to bottom on table component. 
- Inside this method firsty `getOldestTime` method is called with fetchedTransactions list to get oldest time parameter for sending to backend.
- Then a while loop is started to send extra fetch requests until fulfill required amount of data for a table page.
- On each loop blackListed and already sent time parameters has been checked to not send redundant calls.
- Data is fetched with related fetcher method (**fetchTransactions**, **fetchOrders**, **fetchPositions**)
- Then it will sent to **dataDiffCheck** method to get clean data list.
- Once required amount of data is fetched or clean data length is 0, loop will be terminated.
- After that new added data is merged with fetchedTransactions list.
- Then page variables, data count variables etc are updated with added data count value.
- If byPassPageIncrement is true, it will not increment pagesVisible and extraPagesAvailable variables (that case only triggered for Liquidity component for initial less data issue).
- Then all loader animations are stopped.

`dataDiffCheck`( dirtyData: LimitOrderIF[] | PositionIF[] | TransactionIF[])<br />This method gets a dirty list which refers fetched data from backend and compares it with fetchedTransactions list. If there is any difference, it will return clean list which contains only data hich are located in fetchedTransactions list.

`getIndexForPages`( start: boolean, offset = 0)<br />Returns start and end index for fetchedTransactions list according to pagesVisible and pageDataCount variables. start parameter indicates it's called for start index of slice operation. Offset indicates when InfiniteScroll should render also pending transactions to extend indices of slice operation.

`getOldestTime`(  txs: TransactionIF[] | LimitOrderIF[] | PositionIF[])<br />  Returns oldest time parameter for given list

`resetInfiniteScroll`<br />
Resets states of infinite scroll component. That is need once fetch type changed on Transactions component (UserTxs, UserPoolTxs, PoolTxs)

`updateHotTransactions`(  txs: TransactionIF[] | LimitOrderIF[] | PositionIF[])<br />  Triggers from a useEffect which pivotData of InfiniteScroll component is updated. Checks if there are new data which are not located in fetchedTransactions list <br />If current page is first page it will merge new added data with fetchedTransactions list. If not it will save these transactions in hotTransactions list to merge them later on.

`getInitialDataPageCounts`, `addPageDataCount`, `mergePageDataCounts`, `updateInitialPageDataCounts`<br /> 
These methods are used to bind pageDataCount array once component initialized or after new data fetched.
