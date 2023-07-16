import {
    createSchema,
    Type,
    typedModel,
    ExtractDoc,
    ExtractProps,
} from "ts-mongoose";
import { BID_STATUS } from "../../shared/enums";

const BidSchemaDocument = createSchema(
    {
        _id: Type.objectId({ auto: true }),
        id: Type.string({ required: true }),
        employeeId: Type.string({ required: true }),
        jobId: Type.string({ required: true }),
        price: Type.number({ required: true }),
        status: Type.string({ required: true, default: BID_STATUS.PENDING }), // accepted, pending, rejected
    },
    { _id: true, timestamps: { createdAt: true } }
);

export const BidSchema = typedModel("bid", BidSchemaDocument);
export type BidDoc = ExtractDoc<typeof BidSchema>;
export type BidProps = ExtractProps<typeof BidSchema>;

