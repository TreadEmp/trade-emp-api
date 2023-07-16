import { _logger } from "../..";

export abstract class BaseRepository {
    public abstract model: any;

    // Get all
    public getAll = async () => {
        const result: any = await this.model.find({});
        return result;
    };
}
