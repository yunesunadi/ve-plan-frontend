import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private snackBar = inject(MatSnackBar); 

  openSnackBar(msg: string) {
    this.snackBar.open(msg, "Close", {
      horizontalPosition: "end",
      verticalPosition: "top",
    });

    setTimeout(() => {
      this.snackBar.dismiss();
    }, 3000);
  }
}
