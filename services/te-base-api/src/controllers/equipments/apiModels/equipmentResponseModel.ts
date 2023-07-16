import { PaginationInfoDto } from "../../../dto/common/paginationInfoDto";
import { EquipmentsDto } from "../../../dto/equipments/equipmentsDto";

export class EquipmentResponseModel {
    public pagination: PaginationInfoDto;
    public items: EquipmentsDto[];
}
