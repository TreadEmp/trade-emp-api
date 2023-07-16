import { _logger } from "@tradeemp-api-common/util";

export abstract class BaseRepository {
    public abstract model: any;

    // Get all
    public getAll = async () => {
        const result: any = await this.model.find({});
        return result;
    };

    // Count all
    public count = async () => {
        return await this.model.count();
    };

    // Insert
    public insert = async (object: any) => {
        const obj = new this.model(object);
        console.log(`saving ${object}`);
        return await obj.save();
    };

    // Get by id
    public get = async (id: any) => {
        const result = await this.model.findOne({ _id: id });
        return result;
    };

    // Update by id
    public update = async (id: any, body: any) => {
        return await this.model.findByIdAndUpdate({ _id: id }, body);
    };

    // Delete by id
    public delete = async (id: any) => {
        await this.model.findOneAndRemove({ _id: id });
        return true;
    };
}
