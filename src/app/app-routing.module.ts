import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: "create", component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard]},//dynamic path :-angular router
  // { path: "auth", loadChildren: "./auth/auth.module#AuthModule"}, //loadchildtren- allows you to addd path lazily
  { path: "auth", loadChildren: () => import ("./auth/auth.module").then (m => m.AuthModule)} // more modern approach, to prevent error
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard] // added to path you want to guard - create and edit
})
export class AppRoutingModule {}
