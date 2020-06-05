import * as functions from 'firebase-functions';
const serv = require(`${process.cwd()}/dist/web/server/main.js`).app;
export const universal = functions.https.onRequest(serv());
