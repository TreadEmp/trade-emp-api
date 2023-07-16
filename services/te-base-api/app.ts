import "reflect-metadata";
import express from "express";

import { initApplication } from "./appInit";
import { _logger } from "@tradeemp-api-common/util";

const app = express();
const port = process.env.PORT;

initApplication(app)
    .then((success) => {
        app.listen(port, () => {
            _logger.info(`server started at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        _logger.error(`Error Initializing App ${err}`);
    });
