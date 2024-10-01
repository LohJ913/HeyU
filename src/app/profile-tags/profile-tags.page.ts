import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet, NavController } from '@ionic/angular';
import { ToolService } from '../services/tool.service';

@Component({
  selector: 'app-profile-tags',
  templateUrl: './profile-tags.page.html',
  styleUrls: ['./profile-tags.page.scss'],
})
export class ProfileTagsPage implements OnInit {

  constructor(private nav: NavController,
    private ionRouter: IonRouterOutlet,
    public tool: ToolService,
  ) { }

  interest = [
    { "value": "🎤 Board game", "key": "board_game" },
    { "value": "🧗🏻‍♀️ Extreme sport", "key": "extreme_sport" },
    { "value": "🏍️ Heavy bike", "key": "heavy_bike" },
    { "value": "🪩 Clubbing", "key": "clubbing" },
    { "value": "🎮 E-sport", "key": "e_sport" },
    { "value": "🎼 Music", "key": "music" },
    { "value": "👟 Sneakerhead", "key": "sneakerhead" },
    { "value": "💉 Tattoo", "key": "tattoo" },
    { "value": "📷 Photography", "key": "photography" },
    { "value": "🥋 Art", "key": "art" },
    { "value": "✏️ Design", "key": "design" },
    { "value": "🧶 Crafting", "key": "crafting" },
    { "value": "💄 Make-up", "key": "make-up" },
    { "value": "💃🏻 Dancing", "key": "dancing" },
    { "value": "✍🏻 Writing", "key": "writing" },
    { "value": "🎤 Singing", "key": "singing" },
    { "value": "🍺 Beer", "key": "beer" },
    { "value": "🧋 Boba tea", "key": "boba_tea" },
    { "value": "☕ Coffee", "key": "coffee" },
    { "value": "🧉 Gin", "key": "gin" },
    { "value": "🍷 Wine", "key": "wine" },
    { "value": "🥃 Whisky", "key": "whisky" },
    { "value": "🏞️ Outdoor sport", "key": "outdoor_sport" },
    { "value": "🐱 Cat", "key": "cat" },
    { "value": "🐶 Dog", "key": "dog" },
    { "value": "🤩 Being active", "key": "being_active" },
    { "value": "🧠 Being open-minded", "key": "being_open-minded" },
    { "value": "💘 Being romantic", "key": "being_romantic" },
    { "value": "😎 Confidence", "key": "confidence" },
    { "value": "🖌️ Creativity", "key": "creativity" },
    { "value": "💙 Empathy", "key": "empathy" },
    { "value": "🎓 Intelligence", "key": "intelligence" },
    { "value": "🌞 Positivity", "key": "positivity" },
    { "value": "🧐 Self-awareness", "key": "self-awareness" },
    { "value": "⛰️ Sense of adventure", "key": "sense_of_adventure" },
    { "value": "😂 Sense of humour", "key": "sense_of_humour" },
    { "value": "👁️ Social awareness", "key": "social_awareness" },
    { "value": "🏸 Badminton", "key": "badminton" },
    { "value": "🏂 Snowboarding", "key": "snowboarding" },
    { "value": "🏄 Surfing", "key": "surfing" },
    { "value": "🏀 Basketball", "key": "basketball" },
    { "value": "🎳 Bowling", "key": "bowling" },
    { "value": "⚾ Baseball", "key": "baseball" },
    { "value": "🥊 Boxing", "key": "boxing" },
    { "value": "🤿 Scuba diving", "key": "scuba_diving" },
    { "value": "🏎️ Go karting", "key": "go_karting" },
    { "value": "🚴🏻‍♀️ Cycling", "key": "cycling" },
    { "value": "⚽ Soccer", "key": "soccer" },
    { "value": "🏊🏼 Swimming", "key": "swimming" },
    { "value": "🤽 Water polo", "key": "water_polo" }
  ]

  selected = []


  ngOnInit() {
  }

  saveInterest() {

  }

  logScrolling(ev) {
    let header = document.getElementById('header')
    let scrollTop = ev.detail.scrollTop
    var opacity = (scrollTop / 370);
    header.style.backgroundColor = 'rgba(9, 7, 44, ' + opacity + ')';
  }

  makeObj(x) {
    return x ? Object.values(x) : []
  }

  checkselect(x) {
    return Object.values(this.selected || {}).some((a) => (x == a))
  }


  selectHobby(x) {
    if (!Array.isArray(this.selected)) {
      this.selected = [];
    }

    const exists = Object.values(this.selected || {}).some(a => x == a);

    if (exists) {
      // Filter out the element if it already exists
      this.selected = this.selected.filter(a => a != x);
    } else {
      // Push the element if it doesn't exist
      this.selected.push(x);
    }
  }

  save() {
  }


  back() {
    this.ionRouter.canGoBack() ? this.nav.pop() : this.nav.navigateRoot('tabs/tab1')
  }
}
