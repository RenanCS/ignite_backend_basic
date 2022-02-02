
const cors = require('cors');
const express = require('express');
const { NextFunction, Request, Response } = require('express');

const port = process.env.PORT || 3333;

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    return response.send("Backend rodando");
});

app.listen(process.env.PORT || 3333);