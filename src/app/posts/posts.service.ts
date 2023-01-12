import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';//rxjs-observables, objects that pass data
import { map } from 'rxjs/operators';//map method you can use on arrays,this method allows you to transform every element of an array into a new element and store them allback into a new array
import { Router } from "@angular/router";

import { environment } from "../../environments/environment"; // to access apiUrl
import { Post } from './post.model';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable ({providedIn: 'root'})//do the same as adding the post.service.ts to app.module.ts
export class PostsService {
  private posts: Post [] = [];// private -can't edit from outside
  //private postsUpdated = new Subject <Post[] >();//pass a list of post
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();//pass a list of post

  constructor (private http: HttpClient, private router: Router) {}

  getPosts (postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}` ; //`` back ticks - special javascript features which allows us to dynamically add values into a normal string
    this.http
      .get<{message: string, posts: any, maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(
        map(postData => {// pipe is a method that accepts multiple operators we can add
        return {
          posts: postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id, //_id in the backend - in the mongodb
            imagePath: post.imagePath,
            creator: post.creator
          };
        }), 
        maxPosts: postData.maxPosts
      };
      })
      )
      .subscribe(transformedPostData => {
          console.log (transformedPostData);
          this.posts = transformedPostData.posts;
          this.postsUpdated.next({
            posts: [...this.posts],
            postCount: transformedPostData.maxPosts
          });
      });
      //.subscribe(transformedPostData => {
        //console.log (transformedPostData);
       // this.posts = transformedPostData.posts;
        //this.postsUpdated.next([...this.posts]);
        //this.postsUpdated.next({
          //posts: [...this.posts],

        //});
      //});
  }

  getPostUpdateListener () {
    return this.postsUpdated.asObservable(); //return files that we can listen but not emit
  }

  getPost(id: string) {
    //return {...this.posts.find(p => p.id ===id)};
    return this.http.get<{
      _id: string;
       title: string;
       content: string;
       imagePath: string;
       creator: string;
      }>
      (BACKEND_URL + id); //observable
  }

  addPost (title: string, content: string, image: File) {
    const postData = new FormData();//instead of json since it can include a file
    postData.append("title", title);//
    postData.append("content", content);
    postData.append("image", image, title);//from the  backend-router.post single ('image'); title = filename
    this.http
      .post <{message: string, post: Post}>(//from the backed
        BACKEND_URL,
        postData
        )
      .subscribe (responseData => {
        //const post: Post = {
          //id: responseData.post.id,
          //title: title,
          //content: content,
          //imagePath: responseData.post.imagePath
        //};
        //this.posts.push(post);
        //this.postsUpdated.next([...this.posts]);//copy of my post after updating them
        this.router.navigate(["/"]);//back to root route
      });
}

updatePost(id: string, title: string, content: string, image: File | string) {
  let postData: Post | FormData;
  if (typeof image === "object") {//typeof- built in fcn
    postData = new FormData();
    postData.append("id", id);
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
  } else {
    postData = {
      id: id,
      title: title,
      content: content,
      imagePath: image,
      creator: null
    };
  }
  this.http
    .put(BACKEND_URL + id, postData)
    .subscribe(response => {
      console.log (response);
      //const updatedPosts = [...this.posts];
      //const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
      //const post: Post = {
        //id: id,
        //title: title,
        //content: content,
        //imagePath: ""// get image path from server
      //};
      //updatedPosts[oldPostIndex] = post;
      //this.posts = updatedPosts;
      //this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
}


deletePost(postId: string) {
  return this.http.delete(BACKEND_URL + postId);
}
}
  //this.http
    //.delete("http://localhost:3000/api/posts/" + postId)
    //.subscribe(() => {
      //const updatedPosts = this.posts.filter(post => post.id !== postId);//filter allows to only return a subset of the posts array
      //this.posts = updatedPosts;
      //this.postsUpdated.next([...this.posts]);
    //});
//}
//}

//Service - class w/c add to Angular application, centralize task
