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
        var Axis = (function (_super) {
            __extends(Axis, _super);
            function Axis(name) {
                _super.call(this);
                this.name = name;
            }
            Axis.prototype.create = function () {
                console.log('Create ' + this.key);
                // Get the svg container
                var vis = this.fm.get('container').vis;
                this.createAxis(vis);
            };
            Axis.prototype.update = function () {
                console.log('Update ' + this.key);
                // Get the container dimensions
                var dim = this.fm.get('container').dim;
                this.scale = this.getScale(dim);
                this.axis = this.getAxis();
                this.updateAxis(dim);
            };
            Axis.prototype.destroy = function () {
                // Remove the axis container
                this.svg.remove();
            };
            Axis.prototype.createAxis = function (vis) {
                // Create the axis container
                this.svg = vis
                    .append('g')
                    .attr('class', 'axis ' + this.name + '-axis');
            };
            Axis.prototype.updateAxis = function (dim) {
                // Move the axis container to the correct position
                if (this.name === 'x') {
                    this.svg
                        .attr('transform', 'translate(0, ' + dim.innerHeight + ')');
                }
                else if (this.name === 'y') {
                    this.svg
                        .attr('transform', 'translate(0, 0)');
                }
                // Generate the Axis
                this.svg.call(this.axis);
            };
            Axis.prototype.getScale = function (dim) {
                // Create a d3.scale object
                var scale = d3.scale.linear();
                if (this.name === 'x') {
                    scale.range([0, dim.innerWidth]);
                }
                else if (this.name === 'y') {
                    scale.range([dim.innerHeight, 0]);
                }
                return scale;
            };
            Axis.prototype.getAxis = function () {
                // Create a d3 axis generator
                var axis = d3.svg.axis()
                    .scale(this.scale);
                if (this.name === 'x') {
                    axis.orient('bottom');
                }
                else if (this.name === 'y') {
                    axis.orient('left');
                }
                return axis;
            };
            return Axis;
        })(n3Charts.Utils.BaseFactory);
        Factory.Axis = Axis;
    })(Factory = n3Charts.Factory || (n3Charts.Factory = {}));
})(n3Charts || (n3Charts = {}));
//# sourceMappingURL=Axis.js.map