import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { distinctUntilChanged } from 'rxjs';
import { DataService } from '../services/data.service';
import { ToolService } from '../services/tool.service';
import { ReadService } from '../services/read.service';
import firebase from 'firebase'
@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.page.html',
  styleUrls: ['./transaction-list.page.scss'],
})
export class TransactionListPage implements OnInit {

  transactions: any[] = [];
  lastVisible: firebase.firestore.QueryDocumentSnapshot | null = null;
  loading = false;

  transactionList = [
    {
      date: 1727716857000,
      desc: "Gifting from MR OH",
      amount: 1000
    },
    {
      date: 1727716857000,
      desc: "Withdrawal",
      amount: -1000
    },
    {
      date: 1727716857000,
      desc: "Party room AB001",
      amount: 1000
    }
  ]
  uid = localStorage.getItem('heyu_uid') || ''
  constructor(
    private router: IonRouterOutlet,
    private navCtrl: NavController,
    public tool: ToolService,
    private dataService: DataService,
    private readService: ReadService,
  ) { }

  userSubscribe;
  currentUser: any;
  ngOnInit() {
    this.userSubscribe = this.dataService.userInfo.pipe(distinctUntilChanged()).subscribe(async (info) => {
      this.currentUser = info
      // console.log(info)
    })
    this.fetchTransactions()
  }


  ngOnDestroy() {
    if (this.userSubscribe) this.userSubscribe.unsubscribe();
  }

  fetchTransactions() {
    this.loading = true;
    this.readService.getLastXTransactions(this.uid, this.lastVisible)
      .then(result => {
        this.transactions.push(...result.transactions); // Append new transactions
        this.lastVisible = result.lastVisible; // Update the last visible document
        this.loading = false;
        console.log(this.transactions)
      })
      .catch(error => {
        console.error('Error fetching transactions:', error);
        this.loading = false;
      });
  }

  // Trigger more fetching when scrolling down
  onScroll() {
    if (!this.loading) {
      this.fetchTransactions(); // Fetch next 20 transactions
    }
  }
  back() {
    this.router.canGoBack() ? this.navCtrl.pop() : this.navCtrl.navigateRoot('tabs/tab1', { animated: true, animationDirection: 'back' })
  }

  logScrolling(ev) {
    let header = document.getElementById('header')
    let scrollTop = ev.detail.scrollTop
    var opacity = (scrollTop / 100);

    header.style.background = `linear-gradient(180deg, rgba(6,6,14,${opacity}) 0%, rgba(6,6,14,0) 100%)`;
  }

}
