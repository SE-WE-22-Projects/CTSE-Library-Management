import { Document } from 'mongoose';
export type NotificationSettingsDocument = NotificationSettings & Document;
export declare class NotificationSettings {
    userId: string;
    emailEnabled: boolean;
    promotionalEmails: boolean;
}
export declare const NotificationSettingsSchema: import("mongoose").Schema<NotificationSettings, import("mongoose").Model<NotificationSettings, any, any, any, (Document<unknown, any, NotificationSettings, any, import("mongoose").DefaultSchemaOptions> & NotificationSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, NotificationSettings, any, import("mongoose").DefaultSchemaOptions> & NotificationSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, NotificationSettings>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, NotificationSettings, Document<unknown, {}, NotificationSettings, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<NotificationSettings & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<string, NotificationSettings, Document<unknown, {}, NotificationSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    emailEnabled?: import("mongoose").SchemaDefinitionProperty<boolean, NotificationSettings, Document<unknown, {}, NotificationSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    promotionalEmails?: import("mongoose").SchemaDefinitionProperty<boolean, NotificationSettings, Document<unknown, {}, NotificationSettings, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<NotificationSettings & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, NotificationSettings>;
