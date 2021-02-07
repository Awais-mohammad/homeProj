import { ModalController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.page.html',
  styleUrls: ['./image-viewer.page.scss'],
})
export class ImageViewerPage implements OnInit {
  @Input() imageURL;
  constructor(
    public ModalCtrl: ModalController,
  ) { }

  ngOnInit() {
    console.log('image url is->', this.imageURL);

  }
  closePage() {
    this.ModalCtrl.dismiss('viewImage')
  }
}
