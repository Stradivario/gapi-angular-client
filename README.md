# @gapi/angular-client

##### This module is intended to be used with [Gapi Server](https://github.com/Stradivario/gapi) but can be used with every GraphQL Server

##### More detailed documentation you can find [here](https://stradivario.github.io/gapi-angular-client/)

##### For questions/issues you can write ticket [here](http://gitlab.youvolio.com/gapi/gapi-angular-client/issues)

## Installation and basic examples:
##### To install this library, run:

```bash
$ npm install @gapi/angular-client --save
```
NOTICE: Stay tuned angular 6,7,8........etc is preparing at this moment ;)

## Consuming @gapi/angular-client


First we need to install gapi-cli to get Schema introspection

```bash
npm i @gapi/cli -g
```

Create **gapi-cli.conf.yml** file inside root folder of your Repository with the following content

```yml
config:
  schema:
    introspectionEndpoint: http://localhost:9000/graphql
    introspectionOutputFolder: ./src/app/core/api-introspection
```
Read more details inside [Wiki](https://github.com/Stradivario/gapi-cli/wiki/schema) for schema introspection


Define your queries, mutation, subscriptions with `.graphql` extension inside your project:


#### Query findUser

Filename: `findUser.query.graphql`
```typescript
query findUser($id: Int!) {
  findUser(id: $id) {
    id
  }
}
```

#### Subscribe to messages basic

Filename: `subscribeToUserMessagesBasic.subscription.graphql`
```typescript
subscription subscribeToUserMessagesBasic {
  subscribeToUserMessagesBasic {
    message
  }
}
```

#### Mutation publishSignal
Filename: `publishSignal.mutation.graphql`
```typescript
mutation publishSignal($message:String!, $signal: String!){
  publishSignal(message: $message, signal: $signal) {
    message
  }
}
```

Next step `gapi schema introspect --collect-documents --collect-types` will search for `*.graphql` files inside your project then will generate mapping based on file path then
Introspect your current API Schema and collect documents queries based on `*.graphql` files you have in your project

`--collect-types` - argument will generate types based on collected graphql filenames so you will not miss any .graphql file when you use it

Example generated types based on files `*.graphql*` inside your project
```typescript
function strEnum<T extends string>(o: Array<T>): {[K in T]: K} {
    return o.reduce((res, key) => {
        res[key] = key;
        return res;
    }, Object.create(null));
}
const DocumentTypes = strEnum(['findUser.query.graphql',
'publishSignal.mutation.graphql',
'subscribeToUserMessagesBasic.subscription.graphql']);
export type DocumentTypes = keyof typeof DocumentTypes;
```

```bash
gapi schema introspect --collect-documents --collect-types
```

You can define output folder inside `gapi-cli.conf.yml` file

Create alias inside `gapi-cli.conf.yml` (Optional):
```yml
commands:
  documents:
    collect: gapi schema introspect --collect-documents --collect-types
```

Then execute as follow:

```bash
gapi documents collect
```

On Runtime when angular compiler compiles if there is a missmatch between what you wrote and what is generated from schema collection you will get that kind of error:

 ![Alt Text](https://raw.githubusercontent.com/Stradivario/gapi-cli-docs/master/src/assets/images/angular-error.png)


Ts-lint will also give you a sign that something is wrong:

 ![Alt Text](https://raw.githubusercontent.com/Stradivario/gapi-cli-docs/master/src/assets/images/angular-compiler-error.png)

 Also you have one of the best features IDE String literal suggestion

 ![Alt Test](https://raw.githubusercontent.com/Stradivario/gapi-cli-docs/master/src/assets/images/ide-suggestion.png)

### Then you are ready to import GapiApolloModule
##### Import GapiApolloModule.forRoot() in your Angular `AppModule` or `CoreModule`:

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';

// Import @gapi/angular-client
import { GapiApolloModule } from '@gapi/angular-client';

// Enter your uri by default gapi-starter and gapi-advanced-starter are using localhost:9000
const uri = 'localhost:9000';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GapiApolloModule.forRoot({
      uri: `http://${uri}/graphql`,
      subscriptionsUri: `ws://${uri}/subscriptions`
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```


Import GapiApolloService in your Angular `AppComponent` or `YourService`:


```typescript
import { Component, Inject } from '@angular/core';
import { GapiApolloService } from '@gapi/angular-client';
import { IQuery, ISubscription, IMutation } from './core/api-introspection';
import { Subscription } from 'rxjs/Subscription';

// Import Documents that we generated from the previews step
import { DOCUMENTS } from './core/api-introspection/documents';

// Import DocumentTypes
import { DocumentTypes } from './core/api-introspection/documentTypes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  _subscription: Subscription;
  _documentTypes: DocumentTypes = DocumentTypes;
  constructor(
    private gapiApolloService: GapiApolloService
  ) {

    this.gapiApolloService.setGraphqlDocuments(DOCUMENTS);
    // tslint:disable-next-line:max-line-length
    this.gapiApolloService.setAuthorizationToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImtyaXN0aXFuLnRhY2hldkBnbWFpbC5jb20iLCJpZCI6MSwic2NvcGUiOlsiQURNSU4iXSwiaWF0IjoxNTIwMjkxMzkyfQ.9hpIDPkSiGvjTmUEyg_R_izW-ra2RzzLbe3Uh3IFsZg');

    this.gapiApolloService.init();

    // Subscription
    this._subscription = this.subscription().subscribe();

    // Query
    this.query().subscribe();

    // Mutation
    this.mutation().subscribe();

    // To Unsubscribe from subscription
    if (this._subscription) {
      this._subscription.unsubscribe();
    }

  }

  query() {
    return this.gapiApolloService
      .query<IQuery, DocumentTypes>('findUser.query.graphql', {
        id: 1
      })
      .map(res => res.data.findUser);
  }

  mutation() {
    return this.gapiApolloService
      .mutation<IMutation, DocumentTypes>('publishSignal.mutation.graphql', {
        message: 'Hello world',
        signal: 'CREATE_SIGNAL_BASIC'
      })
      .map(res => res.data.publishSignal);
  }

  subscription() {
    return this.gapiApolloService
    .subscription<ISubscription, DocumentTypes>('subscribeToUserMessagesBasic.subscription.graphql')
    .map((res) => res.data.subscribeToUserMessagesBasic);
  }


  async logout() {
    await this.gapiApolloService.resetStore();
    // All store settings are set to default state also Subscription protocol is unsubscribed
  }

}


```


#### Subscription method take first Argument "DocumentTypes" or "SubscriptionOptions
#### Query method take first Argument "DocumentTypes" or "WatchQueryOptions
#### Mutation method take first Argument "DocumentTypes" or "MutationOptions
#### The DocumentTypes argument is name of the GRAPHQL Document introspected for example "findUser.query.graphql"
## Important everytime you want to inspect for new API Schema or adding new `*.graphql` objects you need to start `gapi schema introspect --collect-documents  --collect-types` again to collect new Documents from your application.
To see this example in action go to gapi-cli-docs repository https://github.com/Stradivario/gapi-cli-docs
