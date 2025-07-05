We are in the process of migrating react.js frontend + express API, to a Next.js project.

frontend/ is old frontend code
next/ is new code
worker/ handles async operations not fit for nextjs, also has crypto keys (seperated from next instance due to security)
signaling-server/ handles Quick Share

old expressjs api code is in another repo