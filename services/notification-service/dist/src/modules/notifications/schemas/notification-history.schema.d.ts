import { Document } from 'mongoose';
export type NotificationHistoryDocument = NotificationHistory & Document;
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED"
}
export declare class NotificationHistory {
    recipient: string;
    subject: string;
    content: string;
    status: NotificationStatus;
    errorMessage?: string;
}
export declare const NotificationHistorySchema: import("mongoose").Schema<NotificationHistory, import("mongoose").Model<NotificationHistory, any, any, any, (Document<unknown, any, NotificationHistory, any, import("mongoose").DefaultSchemaOptions> & NotificationHistory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, NotificationHistory, any, import("mongoose").DefaultSchemaOptions> & NotificationHistory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, NotificationHistory>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationHistory, Document<unknown, {}, NotificationHistory, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    recipient?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    subject?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    content?: import("mongoose").SchemaDefinitionProperty<string, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<NotificationStatus, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    errorMessage?: import("mongoose").SchemaDefinitionProperty<string | undefined, NotificationHistory, Document<unknown, {}, NotificationHistory, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationHistory & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, NotificationHistory>;
