var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "@angular/core", "apollo-angular", "apollo-angular-link-http", "apollo-cache-inmemory", "../config", "rxjs/Observable", "@angular/common/http", "apollo-link", "apollo-link-ws", "apollo-utilities", "subscriptions-transport-ws/dist/message-types"], function (require, exports, core_1, apollo_angular_1, apollo_angular_link_http_1, apollo_cache_inmemory_1, config_1, Observable_1, http_1, apollo_link_1, apollo_link_ws_1, apollo_utilities_1, message_types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GapiApolloService = /** @class */ (function () {
        /**
         * @param {?} apollo
         * @param {?} httpLink
         * @param {?} config
         */
        function GapiApolloService(apollo, httpLink, config) {
            this.apollo = apollo;
            this.httpLink = httpLink;
            this.config = config;
            this.http = this.httpLink.create({ uri: this.config.uri });
        }
        /**
         * @param {?=} options
         * @return {?}
         */
        GapiApolloService.prototype.init = function (options) {
            if (this.config.subscriptionsUri) {
                this.createClientWithSubscriptions(options);
            }
            else {
                this.createHttpClient();
            }
        };
        /**
         * @param {?} search
         * @return {?}
         */
        GapiApolloService.prototype.importDocument = function (search) {
            var _this = this;
            var /** @type {?} */ result;
            Object.keys(this.graphqlDocs)
                .filter(function (doc) {
                if (doc.indexOf(search) !== -1) {
                    result = _this.graphqlDocs[doc];
                }
            });
            if (!result) {
                throw new Error("Missing query: " + search);
            }
            return result;
        };
        /**
         * @return {?}
         */
        GapiApolloService.prototype.createHttpClient = function () {
            var _this = this;
            this.apollo.create({
                link: apollo_link_1.concat(new apollo_link_1.ApolloLink(function (operation, forward) {
                    operation.setContext({
                        headers: new http_1.HttpHeaders().set('Authorization', _this.config.authorization)
                    });
                    return forward(operation);
                }), this.http),
                cache: new apollo_cache_inmemory_1.InMemoryCache()
            });
        };
        /**
         * @param {?} token
         * @return {?}
         */
        GapiApolloService.prototype.setAuthorizationToken = function (token) {
            this.config.authorization = token;
        };
        /**
         * @param {?} documents
         * @return {?}
         */
        GapiApolloService.prototype.setGraphqlDocuments = function (documents) {
            try {
                this.graphqlDocs = documents;
            }
            catch (e) {
                throw new Error(e);
            }
        };
        /**
         * @param {?=} options
         * @return {?}
         */
        GapiApolloService.prototype.createClientWithSubscriptions = function (options) {
            var _this = this;
            var /** @type {?} */ config = Object.assign({
                uri: this.config.subscriptionsUri,
                options: {
                    reconnect: true,
                    lazy: true,
                    connectionParams: {
                        token: this.config.authorization,
                    },
                }
            }, options);
            this.webSocketLink = new apollo_link_ws_1.WebSocketLink(config);
            this.wsClient = this.webSocketLink['subscriptionClient'];
            this.apollo.create({
                link: apollo_link_1.concat(new apollo_link_1.ApolloLink(function (operation, forward) {
                    operation.setContext({
                        // tslint:disable-next-line:max-line-length
                        headers: new http_1.HttpHeaders().set('Authorization', _this.config.authorization)
                    });
                    return forward(operation);
                }), apollo_link_1.split(
                // split based on operation type
                function (_a) {
                    var query = _a.query;
                    var _b = (apollo_utilities_1.getMainDefinition(query)), kind = _b.kind, operation = _b.operation;
                    return kind === 'OperationDefinition' && operation === 'subscription';
                }, this.webSocketLink, this.http)),
                cache: new apollo_cache_inmemory_1.InMemoryCache()
            });
        };
        /**
         * @template T, K
         * @param {?} options
         * @param {?=} variables
         * @param {?=} apolloOptions
         * @return {?}
         */
        GapiApolloService.prototype.mutation = function (options, variables, apolloOptions) {
            apolloOptions = apolloOptions || /** @type {?} */ ({});
            if (options.constructor === String) {
                options = __assign({ mutation: this.importDocument(options), variables: variables }, apolloOptions);
            }
            return this.apollo.mutate(/** @type {?} */ (options));
        };
        /**
         * @template T, K
         * @param {?} options
         * @param {?=} variables
         * @param {?=} apolloOptions
         * @return {?}
         */
        GapiApolloService.prototype.watchQuery = function (options, variables, apolloOptions) {
            apolloOptions = apolloOptions || /** @type {?} */ ({});
            if (options.constructor === String) {
                options = __assign({ query: this.importDocument(options), variables: variables }, apolloOptions);
            }
            return this.apollo.watchQuery(/** @type {?} */ (options));
        };
        /**
         * @template T, K
         * @param {?} options
         * @param {?=} variables
         * @param {?=} apolloOptions
         * @return {?}
         */
        GapiApolloService.prototype.query = function (options, variables, apolloOptions) {
            var _this = this;
            apolloOptions = apolloOptions || /** @type {?} */ ({});
            if (options.constructor === String) {
                options = __assign({ query: this.importDocument(options), variables: variables }, apolloOptions);
            }
            return Observable_1.Observable.create(function (observer) {
                var /** @type {?} */ subscription = _this.apollo.watchQuery(/** @type {?} */ (options))
                    .valueChanges
                    .subscribe(function (data) { return observer.next(data); }, function (e) {
                    observer.error(e);
                    subscription.unsubscribe();
                });
            });
        };
        /**
         * @template T, K
         * @param {?} options
         * @param {?=} variables
         * @param {?=} apolloOptions
         * @return {?}
         */
        GapiApolloService.prototype.subscription = function (options, variables, apolloOptions) {
            apolloOptions = apolloOptions || /** @type {?} */ ({});
            if (options.constructor === String) {
                options = __assign({ query: this.importDocument(options), variables: variables }, apolloOptions);
            }
            return this.apollo.subscribe(/** @type {?} */ (options));
        };
        /**
         * @return {?}
         */
        GapiApolloService.prototype.resetStore = function () {
            var _this = this;
            this.wsClient.close();
            this.wsClient['connect']();
            Object.keys(this.wsClient.operations)
                .forEach(function (id) { return _this.wsClient['sendMessage'](id, message_types_1.default.GQL_START, _this.wsClient.operations[id].options); });
            return this.apollo.getClient().resetStore();
        };
        GapiApolloService.decorators = [
            { type: core_1.Injectable },
        ];
        /**
         * @nocollapse
         */
        GapiApolloService.ctorParameters = function () { return [
            { type: apollo_angular_1.Apollo, },
            { type: apollo_angular_link_http_1.HttpLink, },
            { type: undefined, decorators: [{ type: core_1.Inject, args: [config_1.GAPI_APOLLO_MODULE_CONFIG,] },] },
        ]; };
        return GapiApolloService;
    }());
    exports.GapiApolloService = GapiApolloService;
    function GapiApolloService_tsickle_Closure_declarations() {
        /** @type {?} */
        GapiApolloService.decorators;
        /**
         * @nocollapse
         * @type {?}
         */
        GapiApolloService.ctorParameters;
        /** @type {?} */
        GapiApolloService.prototype.http;
        /** @type {?} */
        GapiApolloService.prototype.graphqlDocs;
        /** @type {?} */
        GapiApolloService.prototype.webSocketLink;
        /** @type {?} */
        GapiApolloService.prototype.wsClient;
        /** @type {?} */
        GapiApolloService.prototype.apollo;
        /** @type {?} */
        GapiApolloService.prototype.httpLink;
        /** @type {?} */
        GapiApolloService.prototype.config;
    }
});
