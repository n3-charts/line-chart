module n3Charts.Utils {
  'use strict';

  export class Dataset {
    public values: any[];
    public id: string;

    constructor(values: any[], id:string) {
      this.fromJS(values, id);
    }

    fromJS(values:any[], id:string) {
      this.id = id;
      this.values = values;
    }
  }
}
