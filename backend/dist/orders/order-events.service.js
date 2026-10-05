"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEventsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const HEARTBEAT_MS = 25000;
let OrderEventsService = class OrderEventsService {
    constructor() {
        this.events$ = new rxjs_1.Subject();
    }
    emit(type, order) {
        this.events$.next({ type, order });
    }
    stream() {
        return (0, rxjs_1.merge)((0, rxjs_1.of)({ type: 'ready', data: {} }), this.events$.pipe((0, rxjs_1.map)((e) => ({ type: e.type, data: e.order }))), (0, rxjs_1.interval)(HEARTBEAT_MS).pipe((0, rxjs_1.map)(() => ({ type: 'ping', data: {} }))));
    }
    onModuleDestroy() {
        this.events$.complete();
    }
};
exports.OrderEventsService = OrderEventsService;
exports.OrderEventsService = OrderEventsService = __decorate([
    (0, common_1.Injectable)()
], OrderEventsService);
//# sourceMappingURL=order-events.service.js.map