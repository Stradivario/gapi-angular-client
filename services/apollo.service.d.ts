import { Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkHandler } from 'apollo-angular-link-http';
import { GapiApolloClientOptions } from '../config';
import { Observable } from 'rxjs/Observable';
import { WatchQueryOptions, ApolloQueryResult, SubscriptionOptions, MutationOptions } from 'apollo-client';
import { WebSocketLink } from 'apollo-link-ws';
export declare class GapiApolloService {
    private apollo;
    private httpLink;
    private config;
    http: HttpLinkHandler;
    graphqlDocs: any;
    webSocketLink: WebSocketLink;
    constructor(apollo: Apollo, httpLink: HttpLink, config: GapiApolloClientOptions);
    init(): void;
    importDocument(search: any): any;
    createHttpClient(): void;
    setAuthorizationToken(token: string): void;
    setGraphqlDocuments(documents: any): void;
    createClientWithSubscriptions(): void;
    mutation<T, K>(options: MutationOptions | K, variables?: any): Observable<{
        data: T;
    }>;
    query<T, K>(options: WatchQueryOptions | K, variables?: any): Observable<{
        data: T;
    }>;
    subscription<T, K>(options: SubscriptionOptions | K, variables?: any): Observable<{
        data: T;
    }>;
    resetStore(): Promise<ApolloQueryResult<any>[]>;
}
