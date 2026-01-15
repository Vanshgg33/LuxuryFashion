"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const platform_express_1 = require("@nestjs/platform-express");
const common_1 = require("@nestjs/common");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_2 = require("express");
const app_module_1 = require("../src/app.module");
const expressApp = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://localhost:5173',
    'https://luxury-fashion-sjmv.vercel.app',
    'https://luxury-fashion-sjmv-git-main-vanshs-projects-3fb5c63f.vercel.app',
    'https://luxury-fashion-sjmv-hxszm4b90-vanshs-projects-3fb5c63f.vercel.app',
    'https://luxury-fashion-sjmv-rizein2mm-vanshs-projects-3fb5c63f.vercel.app',
    'https://luxury-fashion-roqh.vercel.app',
    'https://luxury-fashion-roqh-git-main-vanshs-projects-3fb5c63f.vercel.app',
    'https://luxury-fashion-roqh-a7gdadm17-vanshs-projects-3fb5c63f.vercel.app',
    ...(((_a = process.env.APP_URL) === null || _a === void 0 ? void 0 : _a.split(',')) || []),
].filter(Boolean);
function isOriginAllowed(origin) {
    if (!origin)
        return false;
    if (allowedOrigins.includes(origin))
        return true;
    if ((origin.includes('luxury-fashion-sjmv') || origin.includes('luxury-fashion-roqh')) && origin.includes('.vercel.app')) {
        return true;
    }
    return false;
}
let cachedApp;
async function createNestServer() {
    if (cachedApp)
        return cachedApp;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(expressApp));
    expressApp.use((0, express_2.json)({ limit: '4.5mb' }));
    expressApp.use((0, express_2.urlencoded)({ limit: '4.5mb', extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        skipMissingProperties: false,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    app.use((0, cookie_parser_1.default)());
    await app.init();
    cachedApp = expressApp;
    return expressApp;
}
async function handler(req, res) {
    const origin = req.headers.origin;
    if (origin && isOriginAllowed(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
    else if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'false');
    }
    else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'false');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    const server = await createNestServer();
    server(req, res);
}
//# sourceMappingURL=index.js.map