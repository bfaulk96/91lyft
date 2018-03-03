import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  constructor(private navController: NavController) {
  }

  ngOnInit(): void {
  }
}
