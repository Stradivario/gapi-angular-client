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

@Injectable()
export class GapiApolloService {
    http: HttpLinkHandler = this.httpLink.create({ uri: this.config.uri });
    graphqlDocs;
    webSocketLink: WebSocketLink;
    constructor(
        private apollo: Apollo,
        private httpLink: HttpLink,
        @Inject(GAPI_APOLLO_MODULE_CONFIG) private config: GapiApolloClientOptions
    ) {}
    
    init() {
        if (this.config.subscriptionsUri) {
            this.createClientWithSubscriptions();
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

    createClientWithSubscriptions() {
        this.webSocketLink = new WebSocketLink({
            uri: this.config.subscriptionsUri,
            options: {
                reconnect: true,
                connectionParams: {
                    token: this.config.authorization,
                },
            }
        });

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

    mutation<T, K>(options: MutationOptions | K, variables?): Observable<{ data: T }> {
        if (options.constructor === String) {
            options = { mutation: this.importDocument(options), variables };
        }
        return this.apollo.mutate(<any>options)
    }

    query<T, K>(options: WatchQueryOptions | K, variables?): Observable<{ data: T }> {
        if (options.constructor === String) {
            options = { query: this.importDocument(options), variables };
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

    subscription<T, K>(options: SubscriptionOptions | K, variables?: any): Observable<{ data: T }> {
        if (options.constructor === String) {
            options = { query: this.importDocument(options), variables};
        }
        return this.apollo.subscribe(<any>options);
    }

    resetStore(): Promise<ApolloQueryResult<any>[]> {
        this.webSocketLink['subscriptionClient'].close();
        return this.apollo.getClient().resetStore();
    }
}
