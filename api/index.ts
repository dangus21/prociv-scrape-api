import { screenshot } from './scrape';

// import express from 'express';
// const app = express();
// const port = 3000;

// app.get('/', async (req, res) => {
//     const image = await screenshot();
//     res.send(image);
// });

// app.listen(port, () => {
//     console.log('listening on port', port);
// });

import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
    const image = await screenshot();
    res.json({ blob: image });
};
