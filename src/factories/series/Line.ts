module n3Charts.Factory.Series {
  'use strict';

  export class Line extends Utils.BaseFactory {

    public svg: D3.Selection;

    constructor() {
      super();
    }

    create() {
      var container: Container = this.factoryMgr.get('container');

      this.createContainer(container.data);
    }

    createContainer(parent: D3.Selection) {
      this.svg = parent
        .append('g')
          .attr('class', 'line-data');
    }

    update(datasets, options) {
      // Here we will update our line charts
    }

    destroy() {
      this.svg.remove();
    }

  }
}
