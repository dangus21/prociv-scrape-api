const screenshot = require('./scrape');

const express = require('express');
const app = express();
const port = 3000;

app.get('/', async (req, res) => {
    const image = await screenshot();
    res.send({ blob: image });
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('listening on port', port);
});
