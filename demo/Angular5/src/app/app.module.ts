import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { LineChartComponent } from './line-chart/angular5/line-chart/line-chart.component';
// import { ModuleLineChart } from './line-chart/angular5/LineChart.module';


@NgModule({
  declarations: [
    AppComponent,
    LineChartComponent
  ],
  imports: [
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
