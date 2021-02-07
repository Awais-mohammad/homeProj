import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DisplayShopPage } from './display-shop.page';

describe('DisplayShopPage', () => {
  let component: DisplayShopPage;
  let fixture: ComponentFixture<DisplayShopPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayShopPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DisplayShopPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
