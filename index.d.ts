import { ModuleWithProviders } from '@angular/core';
import { GapiApolloClientOptions } from './config';
export declare class GapiApolloModule {
    static forRoot(config: GapiApolloClientOptions): ModuleWithProviders;
}
export * from './config';
export * from './services';
