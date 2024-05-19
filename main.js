import express from 'express';
import cors from 'cors';
import apiLoader from './express-api-loader.js';

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// api用moduleのロード(非同期)
apiLoader(app).then((handler) => app.use(handler));

app.listen(3000, () => console.log(' listening on port 3000.'));
