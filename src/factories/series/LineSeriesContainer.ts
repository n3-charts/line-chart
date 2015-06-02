module n3Charts.Factory.Series {
  'use strict';

  export class LineSeriesContainer extends Utils.BaseFactory {

    public svg: D3.Selection;

    constructor() {
      super();
    }

    create() {
      this.createContainer(this.factoryMgr.get('container').vis);
    }

    createContainer(vis:D3.Selection) {
      this.svg = vis
        .append('g')
          .attr('class', 'line-container');
    }

    update(datasets, options) {
    }

    destroy() {
      this.svg.remove();
    }

  }
}
