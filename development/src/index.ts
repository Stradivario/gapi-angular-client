
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GapiApolloService } from './services/apollo.service';
import { GapiApolloClientOptions, GAPI_APOLLO_MODULE_CONFIG, GAPI_APOLLO_MODULE_DI_CONFIG } from './config';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';

@NgModule({
    imports: [
      CommonModule,
      HttpClientModule,
      ApolloModule,
      HttpLinkModule,
    ],
    providers: [
        GapiApolloService
    ],
    exports: [
      ApolloModule,
      HttpLinkModule,
      HttpClientModule
    ]
})
export class GapiApolloModule {
    public static forRoot(config: GapiApolloClientOptions): ModuleWithProviders {
        return {
            ngModule: GapiApolloModule,
            providers: [
                { provide: GAPI_APOLLO_MODULE_CONFIG, useValue: config || GAPI_APOLLO_MODULE_DI_CONFIG },
                GapiApolloService
            ]
        };
    }
}

export * from './config';
export * from './services';
