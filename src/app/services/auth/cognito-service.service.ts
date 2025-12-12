import { Injectable } from '@angular/core';

import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool

} from 'amazon-cognito-identity-js'

import { environment } from "../../../enviroments/environment";

import { Router } from '@angular/router';

// Datos de la pool de cognito con las variables de acceso de aws
const poolData = {
  UserPoolId: environment.cognitoUserPoolId,
  ClientId: environment.cognitoAppClientId
}

// Se instancia el pool de usuarios con las credenciales de cognito
const userPool = new CognitoUserPool(poolData);

@Injectable({
  providedIn: 'root'
})
export class CognitoServiceService {
  cognitoUser: any;

  constructor(private router: Router) { }

  // Login

  login(emailAddress: any, password: any) {
    const authenticationDetails = new AuthenticationDetails({
      Username: emailAddress,
      Password: password
    });


    let userData = { Username: emailAddress, Pool: userPool};


    // Crear un nuevo usuario de Cognito con los datos del usuario
    this.cognitoUser = new CognitoUser(userData);

    // Autenticar al usuario con los detalles de autenticación del usuario
    this.cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result: any) => {
        this.router.navigate(["/mforms/index"])
      },
      onFailure: (error: any) => {
        //({error})
      }
    })
  }

  // Metodo que verifica si el usuario esta autenticado
  isAuthenticated() {
    return userPool.getCurrentUser() ? true : false
  }

  // Metodo para cerrar sesion
  logOut() {

    // Obtener el usuario actual del grupo de usuarios de Cognito
    this.cognitoUser = userPool.getCurrentUser();

    if (this.cognitoUser) {
      this.cognitoUser.signOut();
      this.router.navigate(["/authentication/login"]);
    }
  }
}
