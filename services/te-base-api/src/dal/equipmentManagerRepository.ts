import { BaseRepository } from "./baseRepository";
import { plainToClassFromExist, plainToClass } from "class-transformer";
import { _clearEmpties, _removeEmpty } from "../utils/filterValidator";
import {EquipmentSchema} from "./models/equipments";
import { EquipmentsDto } from "../dto/equipments/equipmentsDto";

const getFilters = (filterOptions: IFilterOptions): ISelectFilterOptions => _clearEmpties(_removeEmpty({
    category: filterOptions.category ? { $regex: filterOptions.category, $options: "i" } : null,
    name: filterOptions.name ? { $regex: filterOptions.name, $options: "i" } : null,
}));

export default class EquipmentManagerRepository extends BaseRepository {
    // tslint:disable-next-line: member-access
    model: any;
    constructor() {
        super();
        this.model = EquipmentSchema;
    }

    public async createOrUpdateEquipments(equipmentsDto: EquipmentsDto): Promise<EquipmentsDto> {
        const equipment = await this.model.findOneAndUpdate({
            id: equipmentsDto.id,
        },
            {
                $set: equipmentsDto
            },
            { 'new': true, 'safe': true, 'upsert': true });

        let equipmentDto = new EquipmentsDto();
        equipmentDto = plainToClassFromExist(equipmentDto, equipment.toJSON(),
            { excludeExtraneousValues: true });

        return equipmentDto;
    }

    public async getEquipmentCount(
        filterOptions: IFilterOptions
    ) {
        const constantFilters = getFilters(filterOptions);

        return this.model.countDocuments({
            ...constantFilters
        });
    }

    public async getEquipmentList(
        filterOptions: IFilterOptions
    ): Promise<EquipmentsDto[]> {
        const constantFilters = getFilters(filterOptions);

        const equipmentList = await this.model
            .find({
                ...constantFilters
            })
            .skip(filterOptions.skip)
            .limit(filterOptions.limit)
            .sort(filterOptions.sortBy);

        const formattedList: EquipmentsDto[] = equipmentList.map(element => {
            const equipmentsDto = plainToClass(EquipmentsDto, element.toJSON(), {
                excludeExtraneousValues: true
            });
            return equipmentsDto;
        });
        return formattedList;
    }

    public async getEquipmentById(
        equipmentsDto: EquipmentsDto
    ): Promise<EquipmentsDto> {

        const equipment = await this.model
            .findOne({
                id: equipmentsDto.id
            });

        if (equipment) {
            const singleEquipment = plainToClassFromExist(new EquipmentsDto(), equipment.toJSON(),
                {
                    excludeExtraneousValues: true
                });
            return singleEquipment;
        } else {
            return null;
        }
    }

    public async deleteEquipment(equipmentsDto: EquipmentsDto): Promise<any> {
        const equipmentToBeDeleted = await this.model.findOne({
            id: equipmentsDto.id
        });
        if (equipmentToBeDeleted !== null) {
            let equipment = equipmentToBeDeleted.toObject();
            return await this.model.deleteOne({ _id: equipment._id });
        } else {
            return null;
        }
    }

}

export interface IFilterOptions {
    limit: number;
    skip: number;
    sortBy: string;
    name: string;
    category: string;
}
export interface ISelectFilterOptions {
    name: string;
    category: string;
}
