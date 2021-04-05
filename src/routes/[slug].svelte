<script context="module">
  import { base } from '$app/paths';

  export async function load({ page, fetch }) {
    const slug = page.params.slug;
    const post = await fetch(`${base}/${slug}.json`)
        .then((r) => r.json());
    return {
      props: { post }
    };
  }
</script>

<script>
  export let post;
  let date = post.metadata.date.toUpperCase();
</script>

<svelte:head>
  <title>{post.metadata.title}</title>
</svelte:head>

<h1 class="title">{post.metadata.title}</h1>
<p class="info"><a href="https://github.com/zhuzilin">zhuzilin</a> {date}</p>
{@html post.content}

<style lang="scss">
  h1.title {
    margin-bottom: 0;
  }
</style>