import { Injectable, Inject } from '@angular/core';
import { ApolloModule, Apollo, QueryRef } from 'apollo-angular';
import { HttpLinkModule, HttpLink, HttpLinkHandler } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { GapiApolloClientOptions, GAPI_APOLLO_MODULE_CONFIG } from '../config';
import { Observable } from 'rxjs/Observable';
import { WatchQueryOptions, ApolloQueryResult, SubscribeToMoreOptions, SubscriptionOptions, MutationOptions } from 'apollo-client';
import { HttpHeaders } from '@angular/common/http';
import { ApolloLink, concat, split } from 'apollo-link';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { SubscriptionClient } from 'subscriptions-transport-ws';

@Injectable()
export class GapiApolloService {
    http: HttpLinkHandler = this.httpLink.create({ uri: this.config.uri });
    graphqlDocs;
    webSocketLink: WebSocketLink;
    wsClient: SubscriptionClient;
    constructor(
        private apollo: Apollo,
        private httpLink: HttpLink,
        @Inject(GAPI_APOLLO_MODULE_CONFIG) private config: GapiApolloClientOptions
    ) { }

    init(options?: WebSocketLink.Configuration) {
        if (this.config.subscriptionsUri) {
            this.createClientWithSubscriptions(options);
        } else {
            this.createHttpClient();
        }
    }

    importDocument(search) {
        let result;
        Object.keys(this.graphqlDocs)
            .filter(doc => {
                if (doc.indexOf(search) !== -1) {
                    result = this.graphqlDocs[doc];
                }
            });
        if (!result) {
            throw new Error(`Missing query: ${search}`);
        }
        return result;
    }

    createHttpClient() {
        this.apollo.create({
            link: concat(new ApolloLink((operation, forward) => {
                operation.setContext({
                    headers: new HttpHeaders().set('Authorization', this.config.authorization)
                });
                return forward(operation);
            }), this.http),
            cache: new InMemoryCache()
        });
    }

    setAuthorizationToken(token: string) {
        this.config.authorization = token;
    }

    setGraphqlDocuments(documents) {
        try {
            this.graphqlDocs = documents;
        } catch (e) {
            throw new Error(e);
        }
    }

    createClientWithSubscriptions(options?: WebSocketLink.Configuration) {
        const config = Object.assign({
            uri: this.config.subscriptionsUri,
            options: {
                reconnect: true,
                lazy: true,
                connectionParams: {
                    token: this.config.authorization,
                },
            }
        }, options);

        this.webSocketLink = new WebSocketLink(config);
        this.wsClient = this.webSocketLink['subscriptionClient'];
        this.apollo.create({
            link: concat(new ApolloLink((operation, forward) => {
                operation.setContext({
                    // tslint:disable-next-line:max-line-length
                    headers: new HttpHeaders().set('Authorization', this.config.authorization)
                });
                return forward(operation);
            }), split(
                // split based on operation type
                ({ query }) => {
                    const { kind, operation } = <any>getMainDefinition(query);
                    return kind === 'OperationDefinition' && operation === 'subscription';
                },
                this.webSocketLink,
                this.http,
                )),
            cache: new InMemoryCache()
        });
    }

    mutation<T, K>(options: MutationOptions | K, variables?, apolloOptions?: MutationOptions): Observable<{ data: T }> {
        apolloOptions = apolloOptions || <any>{};
        if (options.constructor === String) {
            options = { mutation: this.importDocument(options), variables, ...apolloOptions };
        }
        return this.apollo.mutate(<any>options)
    }

    query<T, K>(options: WatchQueryOptions | K, variables?, apolloOptions?: WatchQueryOptions): Observable<{ data: T }> {
        apolloOptions = apolloOptions || <any>{};
        if (options.constructor === String) {
            options = { query: this.importDocument(options), variables, ...apolloOptions };
        }
        return Observable.create((observer) => {
            const subscription = this.apollo.watchQuery(<any>options)
                .valueChanges
                .subscribe(
                    (data) => observer.next(data),
                    (e) => {
                        observer.error(e);
                        subscription.unsubscribe();
                    }
                );
        });
    }

    subscription<T, K>(options: SubscriptionOptions | K, variables?: any, apolloOptions?: SubscriptionOptions): Observable<{ data: T }> {
        apolloOptions = apolloOptions || <any>{};
        if (options.constructor === String) {
            options = { query: this.importDocument(options), variables, ...apolloOptions };
        }
        return this.apollo.subscribe(<any>options);
    }

    resetStore(): Promise<ApolloQueryResult<any>[]> {
        this.wsClient.close();
        this.wsClient['connect']();
        Object.keys(this.wsClient.operations)
            .forEach((id) => this.wsClient['sendMessage'](id, MessageTypes.GQL_START, this.wsClient.operations[id].options));
        return this.apollo.getClient().resetStore();
    }
}
