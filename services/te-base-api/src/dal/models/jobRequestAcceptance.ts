import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";
import { BID_STATUS, JOB_REQUEST_ACCEPTANCE_STATUS } from "../../shared/enums";

const JobRequestAcceptanceSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        employerId: Type.string({ required: true }),
        jobRequestId: Type.string({ required: true }),
        status: Type.string({
            required: true,
            default: JOB_REQUEST_ACCEPTANCE_STATUS.ONGOING,
        }), // pending, ongoing, completed, canceled
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const JobRequestAcceptanceSchema = typedModel(
    "jobRequestAcceptance",
    JobRequestAcceptanceSchemaDocument
);
export type BidDoc = ExtractDoc<typeof JobRequestAcceptanceSchema>;
export type BidProps = ExtractProps<typeof JobRequestAcceptanceSchema>;
