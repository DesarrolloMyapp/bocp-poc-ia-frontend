import { Injectable, NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { AuthenticationDetails, CognitoUser, CognitoUserAttribute, CognitoUserPool } from 'amazon-cognito-identity-js';
import { environment } from 'src/enviroments/environment';
import { Router } from '@angular/router';

import { fetchAuthSession, signIn, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { signInWithRedirect } from 'aws-amplify/auth';
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';

import { Amplify } from 'aws-amplify';




// import { Auth, Hub } from 'aws-amplify';
// import { AuthUserPool } from 'aws-amplify/auth';


interface IdTokenPayload {
    sub: string;
    email?: string;
    name?: string;
    picture?: string;
    'custom:userFirstName'?: string;
    'custom:userLastName'?: string;
    'custom:userOwnershipData'?: string;
    [key: string]: any; // para atributos dinámicos
}


const POOL_DATA = {
    UserPoolId: environment.cognitoUserPoolId,
    ClientId: environment.cognitoAppClientId
};
const userPool = new CognitoUserPool(POOL_DATA);


Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: environment.cognitoUserPoolId,
            userPoolClientId: environment.cognitoAppClientId,
            loginWith: {
                oauth: {
                    // esta línea activa el flujo hosted UI
                    domain: environment.cognitoDomain,
                    scopes: ['openid', 'email', 'profile', 'phone', 'aws.cognito.signin.user.admin'],
                    redirectSignIn: [environment.domainUrl],
                    redirectSignOut: [environment.domainUrl],
                    responseType: 'code' // o 'token'
                }
            }
        }
    }
});



@Injectable({ providedIn: 'root' })
export class UserService {
    private succedded = false;
    public authStatusChanged = new Subject<boolean>();
    public loggedIn: boolean;
    // private AWS = require('aws-sdk');
    // public static GOOGLE = CognitoHostedUIIdentityProvider.Google;
    private authStates: Subject<CognitoUser | any> = new Subject<CognitoUser | any>();
    public authState: Observable<CognitoUser | any> = this.authStates.asObservable();
    // userLogged = {} as User
    userApi = 'gs1apiedi-user';

    constructor(
        private http: HttpClient,
        // private toastrService: NbToastrService,
        private router: Router,
        private ngZone: NgZone,
        // private dialogService: NbDialogService
    ) {
        // this.socialSignInListener();
    }

    initAuth() {
        this.isAuthenticated().subscribe(auth => this.authStatusChanged.next(auth));
    }


    async getUserClaims(): Promise<IdTokenPayload | null> {
        try {
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();

            if (!idToken) return null;

            // const claims = jwt_decode<IdTokenPayload>(idToken);

            try {
                const payloadBase64 = idToken.split('.')[1];
                const decodedPayload = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
                return JSON.parse(decodedPayload);
            } catch (e) {
                console.error('Error al decodificar el token JWT:', e);
                return null;
            }

            // //('Claims del usuario:', claims);

            // return claims;
        } catch (error) {
            console.error('Error al obtener claims:', error);
            return null;
        }
    }


    isAuthenticated(): Observable<boolean> {
        const user = this.getAuthenticatedUser();
        const obs = new Observable<boolean>(observer => {
            if (!user) {
                observer.next(false);
            } else {
                user.getSession((err: any, session: any) => {
                    if (err) {
                        observer.next(false);
                    }
                    if (session.isValid()) {
                        observer.next(true);
                    } else {
                        observer.next(false);
                    }
                });
            }
            observer.complete();
        });
        return obs;
    }

    async isAuthenticatedUser(): Promise<boolean> {
        try {
            const session = await fetchAuthSession();
            return !!session.tokens?.idToken;
        } catch (error) {
            return false;
        }
    }

    getAuthenticatedUser() {
        return userPool.getCurrentUser();
    }

    async getAuthenticatedUserSession(): Promise<any> {
        try {
            const session = await fetchAuthSession();
            return session;
        } catch (err) {
            console.error('Error en Session Actual', err);
            return null;
        }
    }





    // socialSignIn(provider, email, pasoo): Promise<ICredentials> {
    // 	provider:'auth0IdP';
    // 	return Auth.federatedSignIn({
    // 		provider
    // 	});
    // }



    async socialSignIn(provider: string, email: any, pasoo: any): Promise<void> {
        //("provider", provider)
        await signInWithRedirect({
            provider: { custom: 'auth0IdP' } // 👈 debe coincidir EXACTAMENTE con el nombre del IdP en Cognito
        });
    }




    //signAuth0(): Promise<any> {
    // const filter = userCognitoCode;
    // const openedSession = this.getAuthenticatedUserSession();
    // const queryParam = '?accessToken=' + openedSession.getAccessToken().getJwtToken();
    //const headers = { 'content-type': 'application/json' };
    //return this.http.post('https://gs1apiedi-dev.auth.us-east-1.amazoncognito.com/saml2/idpresponse', '{"client_id":"TdVKJ6Mpn6GtH8Z794wNWwcSi5YMwIcY","client_secret":"CpcaleM8uTWaphOE00l5fsSirv1QOorM-uOfljQbEs1CpEbVTIQ7GLUyytgwOaYS","audience":"https://dev1-gs1mx.us.auth0.com/api/v2/","grant_type":"client_credentials"}', { headers }).toPromise();
    //}

    socialSignInListener() {
        Hub.listen('auth', async ({ payload }) => {
            if (payload.event === 'signedIn') {
                //('Evento signedIn:', payload);

                try {
                    // Espera a que el usuario esté disponible
                    const user = await getCurrentUser();
                    const attributes = await fetchUserAttributes();

                    //('Atributos:', attributes);
                    //('atributos user', user)
                    console.log(attributes);
                    const sub = attributes.sub;
                    const email = attributes.email;
                    const name = attributes.name;
                    const picture = attributes.picture;
                    const theme = attributes['custom:theme'];
                    const firstName = attributes['custom:userFirstName'];
                    const lastName = attributes['custom:userLastName'];
                    const ownershipData = attributes['custom:userOwnershipData'];
                    const role = attributes['custom:userRole'];
                    // const siebelId = attributes['custom:userSiebelId'];

                    this.succedded = true;

                    if (ownershipData) {
                        const [corporationGLN] = ownershipData.split('|');
                        const corporation = {
                            corporationGLN,
                            corporationName: lastName,
                            // corporationSiebelId: siebelId,
                            corporationCreationUser: corporationGLN,
                        };

                        //('Corporation:', corporation);
                    }
                } catch (err) {
                    console.error('Error al obtener usuario o atributos:', err);
                }
            }
        });


    }


    navigate(commands: any[]): void {
        this.ngZone.run(() => this.router.navigate(commands)).then();
    }

    async logout() {
        await signOut({ global: true }); 
        const logoutWin = window.open(
            `https://dev1-gs1mx.us.auth0.com/v2/logout?client_id=mIMNjtpz6MuwkxFt1wq2exdTFL6c2bsD&returnTo=${encodeURIComponent(environment.domainUrl)}`,
            '_blank'
        );
        setTimeout(() => {
            logoutWin?.close();
        }, 3000);
    }

    async signOut(): Promise<void> {
        try {
            await signOut({
                global: true,
            });

            this.loggedIn = false;
        } catch (error) {
            console.error('Error during sign out:', error);
        }
    }



}