# Blog SPA

This is a simple blog SPA on VueJS 3 with Composition API.

> Frontend for https://github.com/kolimbet/blog-composition-back

## Installation

Clone this repository to your server:

```
git clone https://github.com/kolimbet/blog-composition-front.git blog-spa-tst.front
```

Install the necessary NPM packages:

```
npm install
```

Create a file /src/config.js . Where to specify your backend domain in the backendDomain variable

```
export const backendDomain = "http://blog-spa-tst.back";
```

I also use Live Sass Compiler. CSS files compiled by this plugin are imported into the project. The sources are in the /src/scss folder.

Compile the project:

```
npm run dev
```
