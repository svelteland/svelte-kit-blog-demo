---
title: Create Your Blog with SvelteKit
date: 2021-04-03
excerpt: It's time to rewrite your blog in SvelteKit!
---

Recently, SvelteKit is [released in public beta](https://svelte.dev/blog/sveltekit-beta). And we could finally see what Rich Harris called "[Futuristic Web Development](https://www.youtube.com/watch?v=qSfdtmcZ4d0)" looks like. It's always better to learn with project, so I made a little blog (the one you are reading) with SvelteKit and deployed it on the Github Pages. And this series of posts are the things I learnt.

## Brief Intro of Svelte and SvelteKit

For those who are not familiar with Svelte and SvelteKit:

[Svelte](https://svelte.dev/) is a reactive Web component framework. Unlike traditionaly counterparts like React and Vue, Svelte does not use virtual dom (vdom). Instead, Svelte compiles the app to vanilla js during building. This results in an extreme small bundle size and blazing fast speed, as the app no longer contains runtime code and has get rid of the overheads of vdom relevant computation. In addition, Svelte is designed to be very close to plain HTML and CSS, which makes the code clean and easy to read.

[SvelteKit](https://kit.svelte.dev/) is the framework for building Svelte based app. With the help of [Vite](https://vitejs.dev/), SvelteKit provides excellent developing experience.

## Minimal SvelteKit Tutorial

I'm not going to introduce how to use Svelte in this series of posts, as the official doc has done a great job. As for SvelteKit, I will try to cover only the bits and bobs used for the blog app. Anyway, it's very recommended to go through the [Svelte tutorial](https://svelte.dev/tutorial/basics) and the [SvelteKit doc](https://kit.svelte.dev/docs).

### Routing and Layout

The blog site contains 3 types of pages:

- index page: show the list of post titles
- post page: render markdown file into beautiful html
- about page: show about information

In SvelteKit, we have a so-called *a filesystem-based router*. The files in `src/route` will correspond to the actual webpage. In our case, the folder structure of `src/route` would be:

```
route
├── __layout.svelte
├── about.svelte
├── [slug].svelte
└── index.svelte
```

where `about.svelte` will be `xxx.com/about`, `index.svelte` will be `xxx.com/`. As for the `[slug].svelte`, it is a dynamic route, whose dynamic parameter is the `slug` in the bracket. For example, we may have a generated `xxx.com/hello-world`, then SvelteKit will use `[slug].svelte` to generate this page and set `slug` to `hello-world`.

The remaining `__layout.svelte` file serves as the layout template, all other files will be rendered inside the `<slot></slot>` of it.

### Import Components

A typical use of the layout file is adding a navigation bar. In SvelteKit, we should put the extracted components in `src/lib` and use the `$lib/xxx` to import them. In our case, I added a `Nav.svelte` in `src/lib`:

```html
<!--lib/Nav.svelte-->
<div>
  <nav>
    <a href="/"><h3 class="home">HOME</h3></a>
    <a href="/about"><h3 class="about">about</h3></a>
  </nav>
</div>
```

And in `__layout.svelte`, I can import the `Nav` component in this way:

```html
<script>
  import '../app.scss';
  import Nav from '$lib/Nav.svelte';
</script>

<div class="g-app-wrapper">
  <Nav/>
  <slot></slot>
</div>
```

### EndPoints and Data Loading

With routing, layout and components, we could build most of the blog.  But there is one important question: how should we get the markdown file and render it to beautiful html? I'll talk about the details about how to parse the markdown file with `remark` later. For now, let's take a step back: we need to understand how SvelteKit would load the data from server to browser.

In SvelteKit, data are transfered in JSON format. For each page component that requires data, we need to create a corresponding `.json.js` as the endpoints. **Endpoints** in SvelteKit are those `.js` (or `.ts` if you are using TypeScript) files that contains functions for HTTP methods. For example, in the index page, we need to get the list of post titles from the server (assume we are hosting the app with a server instead of generating static pages), therefore, we need to create a `index.json.js` file with a `get` function:

```js
// index.json.js
export function get() {
  // our markdown files lie in src/posts.
  let postTitles = fs.readdirSync(`src/posts`)
      .map(fileName => getTitleFrom(fileName));
  let body = JSON.stringify(postTitles);

  return { body }
}
```

Notive that because the endpoints will be run on the server, we can use libraries like `fs`.

And for the `[slug].svelte` page, we will also have a `[slug].json.js` to get the post html:

```js
// [slug].json.js
export function get({ params }) {
  // we could get the dynamic slug from the parameter of get.
  const { slug } = params;

  const { metadata, content } = process(`src/posts/${slug}.md`);
  const body = JSON.stringify({ metadata, content });

  return { body }
}
```

Now we have the function that supply the data, we can use the `load` function to load them. Take `[slug].svelte` as example, we will add

```html
<script context="module">
  export async function load({ page, fetch }) {
    const slug = page.params.slug;
    const post = await fetch(`${slug}.json`)
        .then((r) => r.json());
    return {
      props: { post }
    };
  }
</script>

<script>
  // post will have metadata and content
  export let post;
</script>

<!--show the post html with @html-->
{@html post.content}
```

to the top of the `[slug].svelte`, so that the page could get data from `${slug}.json`. And remember to add `context="module"` to the script tag around `load`, as we need the data load before the component is rendered.

Similarly, we could add the `load` function to `index.svelte` and this is the basic data stream in SvelteKit.

## Parse and Render the markdown files

For this blog, I chose [remark](https://github.com/remarkjs/remark) as the markdown processor. It is one of the most popular markdown parser now and is the one that supports the great [Gatsby](https://www.gatsbyjs.com/).

[remark](https://github.com/remarkjs/remark) is actually a part of the [unifiedjs](https://unifiedjs.com/) ecosystem, a bunch of tools to help extracting the syntax tree or converting between content formats like markdown or html. To convert a markdown file into html, we could simply:

```js
import vfile from 'to-vfile';
import unified from 'unified';
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import stringify from 'rehype-stringify'

let processor = unified()
    .use(remarkParse)    // parse into markdown syntax tree
    .use(remark2rehype)  // convert to html syntax tree
    .use(stringify)      // turn html syntax tree to html

// process function will return the generated html string.
function process(filename) {
    // use vfile to read the file, could use fs if you like.
    return processor.processSync(vfile.readSync(filename));
}
```

Notice that unifiedjs is organized with multi-repo pattern and all the packages imported in the above snippet are in separate repos.

To get the title of the markdown file for index page, I added a metadata section to the markdown file. I'm not sure if I did this in the correctly, so I'm not going to describe my solution. If you have interest in parsing the metadata of the markdown, please refer to the [`markdown.js`](https://github.com/svelteland/svelte-kit-blog-demo/blob/main/src/lib/markdown.js) file in the repo.

## Conclusion

Hurray! We have built a blog app that runs locally. Next I will show you how to deploy the blog to Github Pages.

## Tips

Some confusing errors could be solved by moving the dependencies to `devDependencies` due to some bugs of Vite.
