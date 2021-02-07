import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { OpenPolyPage } from './open-poly.page';

describe('OpenPolyPage', () => {
  let component: OpenPolyPage;
  let fixture: ComponentFixture<OpenPolyPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenPolyPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(OpenPolyPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
