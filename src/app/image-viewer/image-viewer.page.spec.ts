import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ImageViewerPage } from './image-viewer.page';

describe('ImageViewerPage', () => {
  let component: ImageViewerPage;
  let fixture: ComponentFixture<ImageViewerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageViewerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageViewerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
