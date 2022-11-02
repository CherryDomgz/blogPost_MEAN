import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Subscription } from "rxjs";

import { PostsService } from "../posts.service";
import { Post } from "../post.model";
import { mimeType } from "./mime-type.validator";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit, OnDestroy {
  enteredTitle = "";
  enteredContent = "";
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = "create";
  private postId: string;
  private authStatusSub: Subscription;

  constructor(
    public postsService: PostsService,
    public route: ActivatedRoute, //imported from angular router
    private authService: AuthService
) {}

  ngOnInit() {//initialization task
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(authStatus => {
        this.isLoading = false; //if changes - disable loader
    });

    this.form = new FormGroup ({
      title: new FormControl (null, {//initial value
        validators: [Validators.required, Validators.minLength(3)]//validators since its been removed in the html
      }),//contructor imported from FormGroup, creates a single control in the form

      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {
        validators: [Validators.required],//accept only image
        asyncValidators: [mimeType]// async-takes time to finish, not bind to html and display error
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {//ParamMap -observable
      if (paramMap.has("postId")) {// we identify from our app-routing
        this.mode = "edit";
        this.postId = paramMap.get("postId");
        //this.post = this.postsService.getPost (this.postId); storing the post
        this.isLoading = true;//start loading -spinner
        this.postsService.getPost(this.postId).subscribe(postData => {//execute asynchronosly
          this.isLoading = false;//done loading -spinner
          this.post = {
            id: postData._id,
            title: postData.title,
            content: postData.content,
            imagePath: postData.imagePath,
            creator: postData.creator
          };//data from database
          this.form.setValue({//setValue - overrrides the values for your form controls you registered
            title: this.post.title,
            content: this.post.content,
            image: this.post.imagePath
          });
        });
      } else {
        this.mode = "create";
        this.postId = null;
      }
    });
  }

  onImagePicked(event: Event) {//Event-default type
    const file = (event.target as HTMLInputElement).files[0];//0=first element from the array
    this.form.patchValue({ image: file });//pacth value - target a single control
    this.form.get("image").updateValueAndValidity();
    const reader = new FileReader();//Filereader-feature provided by javascript , convert image to a so-called data(URL)
    reader.onload = () => {//function executed when its done loading
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSavePost() {
    if (this.form.invalid) {//form-registered as class above
      return;
    }
    this.isLoading = true;
    if (this.mode === "create") {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
        );
    } else {
      this.postsService.updatePost(
        this.postId,
        this.form.value.title,
        this.form.value.content,
        this.form.value.image
      );
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}


