import express from 'express';
const app = express()
const port = 3000
import fetch from 'node-fetch';

const getFilterResult = (arr, key, value, body) => {
    if (key) {
        body.forEach((x) => {
            if (key !== 'postId' && x[key].indexOf(value) !== -1) {
                arr.push(x)
            } else if (x[key] == value) {
                arr.push(x)
            }
        });
    }
}

app.get('/', (req, res) => {
    res.end('Hello World!');
});

app.get("/comments", async (req, res) => {
    const query = req.query;
    const response = await fetch('https://jsonplaceholder.typicode.com/comments');
    const body = await response.json();
    const uniqueValue = new Set();
    let result = body;
    let filterResult = [];
    for (const property in query) {
        if (property) {
            getFilterResult(filterResult, property, query[property], body);
        }
    }
    if (filterResult.length > 0) {
        result = filterResult.filter((obj) => {
            const presentSet = uniqueValue.has(obj.id);
            uniqueValue.add(obj.id);
            return !presentSet;
        });
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(result, null, 3));
});

app.get("/posts", async (req, res) => {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const body = await response.text();
    res.end(body);
});

app.get("/posts/:id", async (req, res) => {
    const id = req.params.id
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
    const body = await response.text();
    res.end(body);
});

app.get("/top-posts", async (req, res) => {
    const comments = await fetch('https://jsonplaceholder.typicode.com/comments');
    const posts = await fetch('https://jsonplaceholder.typicode.com/posts');
    const postBody = await posts.json();
    const commentsBody = await comments.json();
    const counts = {};
    commentsBody.forEach((x) => {
        counts[x.postId] = (counts[x.postId] || 0) + 1;
    });
    const mappedPostBody = postBody.map((post) => {
        return {
            post_id: post.id,
            post_title: post.title,
            post_body: post.body,
            total_number_of_comments: counts[`${post.id}`]
        };
    })
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(mappedPostBody, null, 3));
});

app.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`)
});