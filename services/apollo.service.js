define(["require", "exports", "@angular/core", "apollo-angular", "apollo-angular-link-http", "apollo-cache-inmemory", "../config", "rxjs/Observable", "@angular/common/http", "apollo-link", "apollo-link-ws", "apollo-utilities"], function (require, exports, core_1, apollo_angular_1, apollo_angular_link_http_1, apollo_cache_inmemory_1, config_1, Observable_1, http_1, apollo_link_1, apollo_link_ws_1, apollo_utilities_1) {
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
         * @return {?}
         */
        GapiApolloService.prototype.init = function () {
            if (this.config.subscriptionsUri) {
                this.createClientWithSubscriptions();
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
         * @return {?}
         */
        GapiApolloService.prototype.createClientWithSubscriptions = function () {
            var _this = this;
            this.webSocketLink = new apollo_link_ws_1.WebSocketLink({
                uri: this.config.subscriptionsUri,
                options: {
                    reconnect: true,
                    connectionParams: {
                        token: this.config.authorization,
                    },
                }
            });
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
         * @return {?}
         */
        GapiApolloService.prototype.mutation = function (options, variables) {
            if (options.constructor === String) {
                options = { mutation: this.importDocument(options), variables: variables };
            }
            return this.apollo.mutate(/** @type {?} */ (options));
        };
        /**
         * @template T, K
         * @param {?} options
         * @param {?=} variables
         * @return {?}
         */
        GapiApolloService.prototype.query = function (options, variables) {
            var _this = this;
            if (options.constructor === String) {
                options = { query: this.importDocument(options), variables: variables };
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
         * @return {?}
         */
        GapiApolloService.prototype.subscription = function (options, variables) {
            if (options.constructor === String) {
                options = { query: this.importDocument(options), variables: variables };
            }
            return this.apollo.subscribe(/** @type {?} */ (options));
        };
        /**
         * @return {?}
         */
        GapiApolloService.prototype.resetStore = function () {
            this.webSocketLink['subscriptionClient'].close();
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
        GapiApolloService.prototype.apollo;
        /** @type {?} */
        GapiApolloService.prototype.httpLink;
        /** @type {?} */
        GapiApolloService.prototype.config;
    }
});
