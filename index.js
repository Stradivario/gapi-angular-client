define(["require", "exports", "@angular/core", "@angular/common", "./services/apollo.service", "./config", "@angular/common/http", "apollo-angular", "apollo-angular-link-http", "./config", "./services"], function (require, exports, core_1, common_1, apollo_service_1, config_1, http_1, apollo_angular_1, apollo_angular_link_http_1, config_2, services_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GapiApolloModule = /** @class */ (function () {
        function GapiApolloModule() {
        }
        /**
         * @param {?} config
         * @return {?}
         */
        GapiApolloModule.forRoot = function (config) {
            return {
                ngModule: GapiApolloModule,
                providers: [
                    { provide: config_1.GAPI_APOLLO_MODULE_CONFIG, useValue: config || config_1.GAPI_APOLLO_MODULE_DI_CONFIG },
                    apollo_service_1.GapiApolloService
                ]
            };
        };
        GapiApolloModule.decorators = [
            { type: core_1.NgModule, args: [{
                        imports: [
                            common_1.CommonModule,
                            http_1.HttpClientModule,
                            apollo_angular_1.ApolloModule,
                            apollo_angular_link_http_1.HttpLinkModule,
                        ],
                        providers: [
                            apollo_service_1.GapiApolloService
                        ],
                        exports: [
                            apollo_angular_1.ApolloModule,
                            apollo_angular_link_http_1.HttpLinkModule,
                            http_1.HttpClientModule
                        ]
                    },] },
        ];
        /**
         * @nocollapse
         */
        GapiApolloModule.ctorParameters = function () { return []; };
        return GapiApolloModule;
    }());
    exports.GapiApolloModule = GapiApolloModule;
    function GapiApolloModule_tsickle_Closure_declarations() {
        /** @type {?} */
        GapiApolloModule.decorators;
        /**
         * @nocollapse
         * @type {?}
         */
        GapiApolloModule.ctorParameters;
    }
    exports.GAPI_APOLLO_MODULE_CONFIG = config_2.GAPI_APOLLO_MODULE_CONFIG;
    exports.GAPI_APOLLO_MODULE_DI_CONFIG = config_2.GAPI_APOLLO_MODULE_DI_CONFIG;
    exports.GapiApolloService = services_1.GapiApolloService;
});
