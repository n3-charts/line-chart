module n3Charts.Factory {
  'use strict';

  export class StyleSheet extends Utils.BaseFactory {

    public style: Utils.IFactory;

    update(datasets, options, attributes: ng.IAttributes) {
      // Load a style
      this.style = new Style.DefaultStyle();

      // Update a style
      this.style.update(datasets, options, attributes);
    }

    destroy() {
      // Destroy Style
      this.style.destroy();
    }
  }
}
