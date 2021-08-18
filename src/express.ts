import "reflect-metadata";
import {RequestMapper, ResponseMapper} from "@pristine-ts/express";
import {Kernel} from "@pristine-ts/core";
import {AppModule} from "./app.module";

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/json' }))
const port = 3000
const kernel = new Kernel();

const bootstrap = () => {
    app.all('*', async (req, res) => {
        const expressRequestMapper = kernel.container.resolve(RequestMapper);
        const expressResponseMapper = kernel.container.resolve(ResponseMapper);

        expressResponseMapper.reverseMap(await kernel.handleRequest(expressRequestMapper.map(req)), res);
    })

    app.listen(port, async () => {
        await kernel.init(AppModule);

        console.log(`Pristine Business Inteligence Tool listening at http://localhost:${port}`)
    })
}

bootstrap();
