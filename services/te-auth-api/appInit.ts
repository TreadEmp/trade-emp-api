import { initApi } from "./src/controllers/endpoints";
import { connectToDb } from "./src/dal/connectionHandler";
import { initMiddleWares } from "./src/utils/middlewares";
import { _logger } from "@tradeemp-api-common/util";

export const initApplication = async (app) => {
    await connectToDb();
    _logger.info("connection established with database");
    _logger.info("initalizing application");

    app.get("/health", (req, res, next) => {
        res.status(200).json();
    });

    initMiddleWares(app);
    initApi(app);

    _logger.info("initializing of auth api application completed");

};
