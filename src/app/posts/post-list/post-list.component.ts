import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';

import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { AuthService } from "../../auth/auth.service";

@Component ({
    selector: 'app-post-list',
    templateUrl: './post-list.component.html',
    styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  //posts = [
  //  { title: 'First Post', content: 'This is the first post\'s content'},
  //  { title: 'Second Post', content: 'This is the second post\'s content'},
  //  { title: 'Third Post', content: 'This is the third post\'s content'},
  //];
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 0;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string;

  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor (
    public postsService: PostsService,
    private authService: AuthService
    ) {}

  ngOnInit () {
    this.isLoading = true; //before calling get post
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId ();
    this.postsSub = this.postsService
      .getPostUpdateListener()
      //.subscribe((posts: Post[]) => {
        .subscribe((postData: { posts: Post[]; postCount: number}) => {
        //.subscribe((postData:  Post[], postCount) => {
        this.isLoading = false;//after getting updated post
        this.totalPosts = postData.postCount;
        //this.posts = postData.posts;
        this.posts = postData.posts;
      });

    this.userIsAuthenticated = this.authService.getIsAuth();// from the auht.service
    this.authStatusSub = this.authService
        .getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
          this.userId = this.authService.getUserId ();
        });
  }

  onChangedPage (pageData: PageEvent) {
    console.log(pageData);
    this.isLoading = true; //spinner
    this.currentPage = pageData.pageIndex + 1; // since our backend starts with 1
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(postId: string) {
    this.isLoading = true;
    //this.postsService.deletePost(postId);
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }, () => {
      this.isLoading = false;
    });
  }


  ngOnDestroy () {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }
}

