## Sprint Release Schedule 
Release planning is a critical phase in the software development lifecycle that involves determining the scope, timing, and content of a software release. This document provides a procedure for scheduled releases along with a tentative bi-weekly schedule. 

Sprint Length: 2 weeks 
Deployment day: Thursday

The Monday prior to deployment, cut a release candidate branch based on the latest develop branch. 
Any PRs merged in between Monday and Wednesday will be merged into either: 
  a) the develop branch if it SHOULD NOT be included in the sprint 
  b) the release candidate branch if it SHOULD be included 
At the end of every day, merge the release candidate branch back to develop, so that develop is up-to-date. 
On Thursday, the release candidate branch should be merged into staging, after which no more PRs should be merged into the candidate branch. 
Once testing is completed on the staging branch and approved, deployment to the 3 production level branches can be executed. 

Note: Dates and times are tentative, and subject to change as necessary. However, the procedure should still be followed. 
For example, if there is a PR ready for merging prior to the release candidate branch being cut on Monday, the release candidate branch can be created early.