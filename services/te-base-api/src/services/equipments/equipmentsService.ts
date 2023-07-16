import { AbstractService } from "../abstractService";
import { Validator } from "class-validator";
import { _logger } from "@tradeemp-api-common/util";
import { PaginationInfoDto } from "../../dto/common/paginationInfoDto";
import { GET_ERROR_BY_ERROR_CODE, IActionResponse, ERROR_CODES } from "../../utils/errorCodes";
import EquipmentsFilterDto from "../../dto/equipments/equipmentsFilterDto";
import { EquipmentsDto } from "../../dto/equipments/equipmentsDto";
import { SortOrder } from "../../utils/enums";
import EquipmentManagerRepository, { IFilterOptions } from "../../dal/equipmentManagerRepository";

const getFilterOptions = (options: EquipmentsFilterDto): IFilterOptions => ({
    limit: options.pageSize,
    skip: (options.page - 1) * options.pageSize,
    sortBy: "-updatedAt",
    name: options.name,
    category: options.category,
})

export default class EquipmentsService extends AbstractService {
    private equipmentRepo: EquipmentManagerRepository;
    private validator: Validator;
    constructor() {
        super();
        this.equipmentRepo = new EquipmentManagerRepository();
        this.validator = new Validator();
    }

    public async createOrUpdateEquipments(equipmentDto: EquipmentsDto): Promise<IActionResponse> {
        if (equipmentDto.id === undefined) {
            equipmentDto.id = Date.now().toString();
        }
        const Equipment = await this.equipmentRepo.createOrUpdateEquipments(equipmentDto);
        return Equipment === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[10001]) : { success: true, data: Equipment };
    }

    public async getPaginationInfo(
        options: EquipmentsFilterDto
    ): Promise<PaginationInfoDto> {
        const paginationInfo = new PaginationInfoDto();
        const filterOptions = getFilterOptions(options);

        const totalEquipmentCount = await this.equipmentRepo.getEquipmentCount(
            filterOptions
        );
        paginationInfo.pages = Math.ceil(totalEquipmentCount / options.pageSize);
        paginationInfo.pageSize = options.pageSize;
        paginationInfo.items = totalEquipmentCount;
        paginationInfo.currentPage = options.page;

        return paginationInfo;
    }

    public async getEquipmentList(
        options: EquipmentsFilterDto
    ): Promise<EquipmentsDto[]> {
        const filterOptions = getFilterOptions(options);

        if (!this.validator.isEmpty(options.sort)) {
            if (String(options.sort) === SortOrder[SortOrder.asc]) {
                filterOptions.sortBy += `${options.order}`;
            } else {
                filterOptions.sortBy += `-${options.order}`;
            }
        }

        const Equipments = await this.equipmentRepo.getEquipmentList(
            filterOptions
        );
        return Equipments;
    }

    public async getEquipmentById(equipmentsDto: EquipmentsDto): Promise<IActionResponse> {
        const Equipment = await this.equipmentRepo.getEquipmentById(equipmentsDto);
        return Equipment === null ? GET_ERROR_BY_ERROR_CODE(ERROR_CODES[11002]) : { success: true, data: Equipment };
    }

    public async deleteEquipment(equipmentsDto: EquipmentsDto): Promise<IActionResponse> {
        const result = await this.equipmentRepo.deleteEquipment(equipmentsDto);
        return result === null
            ? GET_ERROR_BY_ERROR_CODE(
                ERROR_CODES[11002]
            )
            : { success: true, data: result };
    }
}
