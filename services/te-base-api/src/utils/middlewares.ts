import * as bodyParser from "body-parser";
import * as cors from "cors";
import { Application } from "express";
import { _logger, authorizer } from "@tradeemp-api-common/util";

export const initMiddleWares = (app: Application) => {
    _logger.info("initializing middlewares");
    app.use(bodyParser.json());
    app.use(cors.default());
    app.use(authorizer);
};
