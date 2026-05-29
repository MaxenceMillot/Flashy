const title = encodeURIComponent("\[Bug] ");

const body = encodeURIComponent(`

\## Description

Describe the issue here.



\## Steps to reproduce

1\.

2\.

3\.



\## Device

\- OS:

\- Browser:

\- App version:

`);



window.open(

&#x20;   `https://github.com/MaxenceMillot/Flashy/issues/new?title=${title}\&body=${body}`,

&#x20;   "\_blank"

);

