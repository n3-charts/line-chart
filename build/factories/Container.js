var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var n3Charts;
(function (n3Charts) {
    var Factory;
    (function (Factory) {
        'use strict';
        var Container = (function (_super) {
            __extends(Container, _super);
            function Container(element) {
                _super.call(this);
                this.element = element;
            }
            Container.prototype.create = function () {
                console.log('Create ' + this.key);
                this.createRoot();
                this.createContainer();
            };
            Container.prototype.update = function () {
                console.log('Update ' + this.key);
                this.dim = this.getDimensions();
                this.updateRoot();
                this.updateContainer();
            };
            Container.prototype.destroy = function () {
                // Remove the root node
                this.svg.remove();
            };
            Container.prototype.createRoot = function () {
                // Create the SVG root node
                this.svg = d3.select(this.element)
                    .append('svg')
                    .attr('class', 'chart');
            };
            Container.prototype.updateRoot = function () {
                // Update the dimensions of the root
                this.svg
                    .attr('width', this.dim.width)
                    .attr('height', this.dim.height);
            };
            Container.prototype.createContainer = function () {
                // Create a visualization container
                this.vis = this.svg
                    .append('g')
                    .attr('class', 'container');
            };
            Container.prototype.updateContainer = function () {
                // Update the dimensions of the container
                this.vis
                    .attr('width', this.dim.innerWidth)
                    .attr('height', this.dim.innerHeight)
                    .attr('transform', 'translate(' + this.dim.margin.left + ', ' + this.dim.margin.top + ')');
            };
            Container.prototype.getDimensions = function () {
                // Get the dimensions of the chart
                return {
                    width: 600,
                    height: 200,
                    innerWidth: 560,
                    innerHeight: 160,
                    margin: {
                        left: 20,
                        bottom: 20,
                        right: 20,
                        top: 20
                    }
                };
            };
            return Container;
        })(n3Charts.Utils.BaseFactory);
        Factory.Container = Container;
    })(Factory = n3Charts.Factory || (n3Charts.Factory = {}));
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=Container.js.map