import mongoose from "mongoose";
import { _logger } from "@tradeemp-api-common/util";

export const connectToDb = async () => {
    _logger.info(`Establishing mongo connection ${process.env.MONGODB_URI}`);

    await mongoose.connect(`${process.env.MONGODB_URI}`, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
    });

    _logger.info("Connection Established");
};
