define(["require", "exports", "@angular/core"], function (require, exports, core_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GAPI_APOLLO_MODULE_CONFIG = new core_1.InjectionToken('apollo.module.config');
    exports.GAPI_APOLLO_MODULE_DI_CONFIG = ({
        uri: 'http://localhost:9000',
        subscriptionsUri: 'ws://localhost:9000/subscriptions'
    });
});
