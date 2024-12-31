const express = require('express');
const authRoutes = require('./routes/auth');
//const uploadRoutes = require('./routes/upload');
const folderUploadRoutes = require('./routes/folder-upload');
const mediaRoutes = require('./routes/media');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => res.send('Welcom to media world'));

app.use('/auth', authRoutes);
//app.use('/media', uploadRoutes);
app.use('/folder-media',folderUploadRoutes);
app.use('/files', mediaRoutes);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));