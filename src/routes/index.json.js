import { process } from '$lib/markdown';
import fs from 'fs';
import dayjs from 'dayjs';

export function get() {
  let posts = fs.readdirSync(`src/posts`)
      .filter(fileName => /.+\.md$/.test(fileName))
      .map(fileName => {
        const { metadata } = process(`src/posts/${fileName}`);
        return {
          metadata,
          slug: fileName.slice(0, -3)
        };
      });
  // sort the posts by create date.
  posts.sort((a, b) => (dayjs(a.metadata.date, "MMM D, YYYY") -
                        dayjs(b.metadata.date, "MMM D, YYYY")));
  let body = JSON.stringify(posts);

  return {
    body
  }
}