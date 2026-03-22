"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const package_json_1 = require("../../package.json");
const databaseConfig = () => ({
    uri: process.env['MONGO_URI'],
    dbName: package_json_1.name,
});
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map