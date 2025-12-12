import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { CognitoServiceService } from "src/app/services/auth/cognito-service.service";


@Injectable({
  providedIn: 'root'
})

export class AuthGuard {
  constructor(private authService: CognitoServiceService, private router: Router){}

  canActivate(): boolean {
    return true;
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/authentication/login'])
    return false;
  }
}
