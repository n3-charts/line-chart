module n3Charts.Utils {
  'use strict';

  export interface IPoint {
    x: number;
    y0: number;
    y1: number;
  }

  export class Dataset {

    // ID of the dataset
    public id: string;

    // Unparsed dataset values
    public values: any[];

    constructor(values: any[], id:string) {
      this.fromJS(values, id);
    }

    fromJS(values:any[], id:string) {
      this.id = id;
      this.values = values;
    }
  }
}
