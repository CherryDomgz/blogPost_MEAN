import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { SignupComponent } from "./signup/signup.component";

const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)//child routes which will be merge to root child
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
