import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of } from "rxjs";//of - quick and easier way of adding observable quickly

export const mimeType = (
  control: AbstractControl//argument, asynchronous validator
): Promise<{ [key: string]: any }> | Observable<{ [key: string]: any }> => {//Promise-generic []-indicate dynamic property  name
  if (typeof(control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = Observable.create(//create own observable from scratch
    (observer: Observer<{ [key: string]: any }>) => {
      fileReader.addEventListener("loadend", () => {
        const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);//read certain patters in the file, advanced
        let header = "";
        let isValid = false;
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);//hevadecimal string
        }
        switch (header) {//codes - stands for certain file types, eg.PNG,JPEG
          case "89504e47":
            isValid = true;
            break;
          case "ffd8ffe0":
          case "ffd8ffe1":
          case "ffd8ffe2":
          case "ffd8ffe3":
          case "ffd8ffe8":
            isValid = true;
            break;
          default:
            isValid = false; // Or you can use the blob.type as fallback
            break;
        }
        if (isValid) {
          observer.next(null);
        } else {
          observer.next({ invalidMimeType: true });
        }
        observer.complete();
      });
      fileReader.readAsArrayBuffer(file);//allow us to access MIME type
    }
  );
  return frObs;
};
