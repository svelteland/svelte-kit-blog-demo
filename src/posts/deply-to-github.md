---
title: Deploy the blog to Github Pages
date: 2021-04-04
excerpt: "Fun fact: Github Pages is free!"
---

After the first post, we already have a blog that runs on the local machine. Now, let's deploy it to Github Pages!

## Change to static adapter

Adapters in SvelteKit are small plugins for building apps on specific platform. The default adapter of a SvelteKit app is `adapter-node`, which runs the app with a simple Node server. To host the app to Github Pages, we need to convert the app to static files with `adapter-static`.

```bash
npm i -D @sveltejs/adapter-static@next
```

And change the adapter part of `svelte.config.js` to:

```js
import adapter from '@sveltejs/adapter-static';
```

## Use gh-pages to deploy

After setting the static adapter, run:

```bash
npm run build
```

to build the app. The building result is stored in `build` folder. Then we could use the `gh-pages` library to deploy the app.

```bash
npm i -D gh-pages
```

And add a `deploy` command in `package.json` as

```json
"deploy": "npm run build && npx gh-pages -d build"
```

Before running deploy, we need to upload the app to Github as a new repository. Afterall, you could not have a Github Pages blog without a Github repo. If you have never uploaded any code to Github before, going through the [Getting started](https://docs.github.com/en/github/getting-started-with-github) pages in official Github doc is a good idea.

After creating a corresponding repo (in my case [svelteland/svelte-kit-blog-demo](https://github.com/svelteland/svelte-kit-blog-demo)), we could run the deploy command:

```bash
npm run deploy
```

The `gh-pages` library will post the files in `.svelte-kit/static/build` folder to a new remote branch -- `gh-pages`, where Github Pages will look for static contents to host. The root url of the hosted app is `xxx.github.io/yyy` if your app is `xxx/yyy`. In my case, the address is `svelteland.github.io/svelte-kit-blog-demo`.

Are we all set? Unfortunately, we are not... The hosted app does not work. All the CSS and JavaScripts are missing and  the routing is a mess. The reason for those is that the root for a Github Pages is, as we just mentioned, `xxx.github.io/yyy`, instead of `xxx.github.io`. Therefore we need to configure the relative directory, so that when looking for `a.css`, the app knows we actually need `xxx.github.io/yyy/a.css` but not `xxx.github.io/a.css`.

Apart from that, lots of CSS and js files are in `.svelte-kit/static/build/_app` folder. However, the folder starts with underscore are ignored by Github Pages because of Jekyll. We need to disable Jekyll by updating the 2 command below in `package.json`:

```json
"build": "rm -rf build && svelte-kit build && touch .svelte-kit/static/build/.nojekyll",
"deploy": "npm run build && npx gh-pages -d .svelte-kit/static/build -t true"
```

where the `-t true` flag in `deploy` is to make the `gh-pages` upload files starts with dot.

## Set relative path

First we need to set the `paths.base` and `paths.assets` config in `svelte.config.js` to the relative path. In my case, it is:

``` json
// Comment the paths if wants to run in dev mode.
paths: {
  base: '/svelte-kit-blog-demo',
  assets: '/svelte-kit-blog-demo'
},
```

Then, we should update the directory or href in our component or javascript files with `paths.base`. For example, in the `Nav` component, we need to update the `href` in `a`:

```html
<!-- lib/Nav.svelte -->
<script>
  import { base } from '$app/paths';
</script>

<div>
  <nav>
    <a href="{base}/"><h3 class="home">HOME</h3></a>
    <a href="{base}/about"><h3 class="about">about</h3></a>
  </nav>
</div>
```

Or in `index.svelte`, we need to update the json to load:

```js
  import { base } from '$app/paths';

  export async function load({ fetch }) {
    const posts = await fetch(`${base}/index.json`)
        .then((r) => r.json());
    return {
      props: { posts }
    }
  }
```

After configuring these paths, rerun `npm run deploy`, you could see your app running correctly!

P.S. Don't forget to clean the browser cache after the new deploy.
