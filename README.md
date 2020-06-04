# Angular-Universal-Firebase
A newest guide to explain how to do a Server-Side-Render SPA with Angular and Firebase overcoming some problems when build and deploy.

### Original guide(s)
* <a href="https://github.com/hiepxanh/angularfire2/blob/a45e0ad4f1c918e78a1610d2b73dee3cc9b1f6b1/docs/universal/getting-started.md">Getting started with AngularFire and Universal</a>
* <a href="https://github.com/hiepxanh/angularfire2/blob/a45e0ad4f1c918e78a1610d2b73dee3cc9b1f6b1/docs/universal/cloud-functions.md">Deploying your Universal application on Cloud Functions for Firebase</a>

#### Version health check
- Angular CLI: 9.0.7
- Node: 10.13.0
- @angular/fire v6.0.0

Check your angular-cli version before start. <br>
<br>
NOTE: project's name is <b>web</b> and it is referred by multiple files figured in this guide.

### 1. Generate workspace and application
```
ng new workspace --createApplication="false"
cd workspace  
ng generate application web  
```
```
ng add @nguniversal/express-engine --clientProject=web 
ng add @angular/fire --clientProject=web
npm i @angular/fire@6.0.0 --save
```
If CLI shows you this message: ```We detected an Angular Universal project. Do you want to deploy as a Firebase 
Function?``` select <b>NO</b> (we'll do this later).

### 2. Edit server.ts (root workspace dir) 
```
...
// Insert polyfills at the top of file, required for Firebase
(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');
...

```
### 3. Setup Firebase env.
- follow this guilde https://github.com/angular/angularfire/blob/master/docs/install-and-setup.md

### 4. Local running
`npm run dev:ssr`

### 5. Add Firebase
In root dir:
```bash
firebase init
```
Select at least `functions` and `hosting`. Typescript for Cloud Functions and the default `public` directory for Hosting.

### 6. Edit files 
###### firebase.json (root workspace dir)
```js
{
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "universal"
      }
    ]
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run lint",
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  }
}
```
###### package.json (root workspace dir)
```js
"scripts": {
  // ...  
  "build": "ng build && npm run copy:hosting && npm run build:ssr && npm run build:functions",
  "copy:hosting": "cp -r ./dist/web/* ./public && rm -rf ./public/index.html",
  "build:functions": "npm run --prefix functions build",
},
```
With the flag <b>f</b> (-rf) we can avoid errors if files don't exist.

###### functions/package.json 
```js
  // ...
  "scripts": {
    // ...
    "build": "rm -rf ./dist && cp -r ../dist . && tsc"
  },
  "engines": {
    "node": "10"
  },
  // ...
```
Again, flag -f missing in the original guide.<br>
Node env. v10 as requests by Firebase Cloud Function.

###### functions/src/index.ts
```ts
import * as functions from 'firebase-functions';
const serv = require(`${process.cwd()}/dist/web/server/main.js`).app;
export const universal = functions.https.onRequest(serv());
```
In the original guide, the require(`${process.cwd()}/dist/web/server`) causes:
> Error: Cannot find module '/PATH_TO_WS/workspace/functions/dist/web/server'

Also, thanks to Luciano answer: https://stackoverflow.com/questions/61352383/timeout-when-routing-angular-9-universal-firebase/ for this script's structure: it resolves timeout problems encountered following the original guide's script. 

### 7. Time to build (and deploy)
Now everything seems ready to build by the command ```npm run build```. Personally I stumbled in multiple errors (4):
- > Module '"../../parse5/lib"' has no exported member 'ElementLocation'.

- > Cannot find name 'BigInt', 'BigInt64Array', 'BigUint64Array'

To solve these problems:
- ```npm i -D parse5@latest``` in root workspace dir (maybe also in functions' dir)

- change target from "es2017" to "esnext" in functions/tsconfig.json 

After that, run ```npm run build```. If everythink is ok, you can serve and deploy by: ```firebase serve``` and ```firebase deploy```. 







