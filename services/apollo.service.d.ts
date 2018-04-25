import { Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular-link-http';
import { GapiApolloClientOptions } from '../config';
import { Observable } from 'rxjs/Observable';
import { WatchQueryOptions, ApolloQueryResult, SubscriptionOptions, MutationOptions } from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
export declare class GapiApolloService {
    private apollo;
    private httpLink;
    private config;
    http: HttpLinkHandler;
    graphqlDocs: any;
    webSocketLink: WebSocketLink;
    wsClient: SubscriptionClient;
    constructor(apollo: Apollo, httpLink: HttpLink, config: GapiApolloClientOptions);
    init(options?: WebSocketLink.Configuration): void;
    importDocument(search: any): any;
    createHttpClient(): void;
    setAuthorizationToken(token: string): void;
    setGraphqlDocuments(documents: any): void;
    createClientWithSubscriptions(options?: WebSocketLink.Configuration): void;
    mutation<T, K>(options: MutationOptions | K, variables?: any, apolloOptions?: MutationOptions): Observable<{
        data: T;
    }>;
    query<T, K>(options: WatchQueryOptions | K, variables?: any, apolloOptions?: WatchQueryOptions): Observable<{
        data: T;
    }>;
    subscription<T, K>(options: SubscriptionOptions | K, variables?: any, apolloOptions?: SubscriptionOptions): Observable<{
        data: T;
    }>;
    resetStore(): Promise<ApolloQueryResult<any>[]>;
}
