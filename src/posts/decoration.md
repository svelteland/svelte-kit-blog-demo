---
title: Decorating Your Blog
date: 2021-04-05
excerpt: Little code but fancy look!
---

This is a post on some isolated styling features I added to this blog site and it may grow while I update the site. You could certainly skip this one and starting work on your own blog~

## Add Code Highlighting

> Without highlighting, code are just paragraphs of chaos...

As we are using the remark (unified.js) ecosystem, it' s pretty easy to add code highlighting to our markdown posts. We could simply add the [highlight.js](https://highlightjs.org/) plugin — [rehype-highlight](https://github.com/rehypejs/rehype-highlight) to the remark processor:

```js
import highlight from 'rehype-highlight';

let runner = unified()
    .use(remark2rehype)
    .use(highlight)
    .use(rehypeStringify);
```

And the generated html would have the class names of highlight.js.

Then, attach the desired style theme to the header in `__layout.svelte`. In this project, I chosed the github theme:

```html
<svelte:head>
  <link rel="stylesheet"
    href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/github.min.css">
</svelte:head>
```

And now comes the highlighted code!

```c
#include <stdio.h>
int main() {
   printf("Hello, World!");
   return 0;
}
```

## Add a Github Corner

It's very common to have a link to the Github repo and it is super easy using Svelte. I chose [tholman/github-corners](https://tholman.com/github-corners/) as the corner component and its web component can be directly used as a `.svelte` file. Then simply add a `GithubCorner` component to the layout will do the trick:

```html
<script>
  import '../app.scss';
  import Nav from '$lib/Nav.svelte';
  import GithubCorner from '$lib/GithubCorner.svelte';
</script>

<GithubCorner/>

<div class="g-app-wrapper">
  <Nav/>
  <slot></slot>
</div>
```
