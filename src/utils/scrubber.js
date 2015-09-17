(function() {
  ({
    showScrubber: function(svg, glass, axes, data, options, dispatch, columnWidth) {
      var that;
      that = this;
      glass.on('mousemove', function() {
        svg.selectAll('.glass-container').attr('opacity', 1);
        return that.updateScrubber(svg, d3.mouse(this), axes, data, options, dispatch, columnWidth);
      });
      return glass.on('mouseout', function() {
        glass.on('mousemove', null);
        return svg.selectAll('.glass-container').attr('opacity', 0);
      });
    },
    getClosestPoint: function(values, xValue) {
      var d, d0, d1, i, xBisector;
      xBisector = d3.bisector(function(d) {
        return d.x;
      }).left;
      i = xBisector(values, xValue);
      if (i === 0) {
        return values[0];
      }
      if (i > values.length - 1) {
        return values[values.length - 1];
      }
      d0 = values[i - 1];
      d1 = values[i];
      d = xValue - d0.x > d1.x - xValue ? d1 : d0;
      return d;
    },
    updateScrubber: function(svg, _arg, axes, data, options, dispatch, columnWidth) {
      var ease, positions, that, tickLength, x, y;
      x = _arg[0], y = _arg[1];
      ease = function(element) {
        return element.transition().duration(50);
      };
      that = this;
      positions = [];
      data.forEach(function(series, index) {
        var color, item, lText, left, rText, right, side, sizes, text, v, xInvert, xPos, yInvert;
        item = svg.select(".scrubberItem.series_" + index);
        if (options.series[index].visible === false) {
          item.attr('opacity', 0);
          return;
        }
        item.attr('opacity', 1);
        xInvert = axes.xScale.invert(x);
        yInvert = axes.yScale.invert(y);
        v = that.getClosestPoint(series.values, xInvert);
        dispatch.focus(v, series.values.indexOf(v), [xInvert, yInvert]);
        text = v.x + ' : ' + v.y;
        if (options.tooltip.formatter) {
          text = options.tooltip.formatter(v.x, v.y, options.series[index], v.raw);
        }
        right = item.select('.rightTT');
        rText = right.select('text');
        rText.text(text);
        left = item.select('.leftTT');
        lText = left.select('text');
        lText.text(text);
        sizes = {
          right: that.getTextBBox(rText[0][0]).width + 5,
          left: that.getTextBBox(lText[0][0]).width + 5
        };
        side = series.axis === 'y2' ? 'right' : 'left';
        xPos = axes.xScale(v.x);
        if (side === 'left') {
          if (xPos + that.getTextBBox(lText[0][0]).x - 10 < 0) {
            side = 'right';
          }
        } else if (side === 'right') {
          if (xPos + sizes.right > that.getTextBBox(svg.select('.glass')[0][0]).width) {
            side = 'left';
          }
        }
        if (side === 'left') {
          ease(right).attr('opacity', 0);
          ease(left).attr('opacity', 1);
        } else {
          ease(right).attr('opacity', 1);
          ease(left).attr('opacity', 0);
        }
        positions[index] = {
          index: index,
          x: xPos,
          y: axes[v.axis + 'Scale'](v.y + v.y0),
          side: side,
          sizes: sizes
        };
        color = angular.isFunction(series.color) ? series.color(v, series.values.indexOf(v)) : series.color;
        item.selectAll('circle').attr('stroke', color);
        return item.selectAll('path').attr('fill', color);
      });
      positions = this.preventOverlapping(positions);
      tickLength = Math.max(15, 100 / columnWidth);
      return data.forEach(function(series, index) {
        var item, p, tt, xOffset;
        if (options.series[index].visible === false) {
          return;
        }
        p = positions[index];
        item = svg.select(".scrubberItem.series_" + index);
        tt = item.select("." + p.side + "TT");
        xOffset = (p.side === 'left' ? series.xOffset : -series.xOffset);
        tt.select('text').attr('transform', function() {
          if (p.side === 'left') {
            return "translate(" + (-3 - tickLength - xOffset) + ", " + (p.labelOffset + 3) + ")";
          } else {
            return "translate(" + (4 + tickLength + xOffset) + ", " + (p.labelOffset + 3) + ")";
          }
        });
        tt.select('path').attr('d', that.getScrubberPath(p.sizes[p.side] + 1, p.labelOffset, p.side, tickLength + xOffset));
        return ease(item).attr({
          'transform': "translate(" + (positions[index].x + series.xOffset) + ", " + positions[index].y + ")"
        });
      });
    },
    getScrubberPath: function(w, yOffset, side, padding) {
      var h, p, xdir, ydir;
      h = 18;
      p = padding;
      w = w;
      xdir = side === 'left' ? 1 : -1;
      ydir = 1;
      if (yOffset !== 0) {
        ydir = Math.abs(yOffset) / yOffset;
      }
      yOffset || (yOffset = 0);
      return ["m0 0", "l" + xdir + " 0", "l0 " + (yOffset + ydir), "l" + (-xdir * (p + 1)) + " 0", "l0 " + (-h / 2 - ydir), "l" + (-xdir * w) + " 0", "l0 " + h, "l" + (xdir * w) + " 0", "l0 " + (-h / 2 - ydir), "l" + (xdir * (p - 1)) + " 0", "l0 " + (-yOffset + ydir), "l1 0", "z"].join('');
    },
    preventOverlapping: function(positions) {
      var abscissas, getNeighbours, h, offset;
      h = 18;
      abscissas = {};
      positions.forEach(function(p) {
        var _name;
        abscissas[_name = p.x] || (abscissas[_name] = {
          left: [],
          right: []
        });
        return abscissas[p.x][p.side].push(p);
      });
      getNeighbours = function(side) {
        var foundNeighbour, neighbourhood, neighbours, neighboursForX, p, sides, x, y, _ref;
        neighbours = [];
        for (x in abscissas) {
          sides = abscissas[x];
          if (!abscissas.hasOwnProperty(x)) {
            continue;
          }
          if (sides[side].length === 0) {
            continue;
          }
          neighboursForX = {};
          while (sides[side].length > 0) {
            p = sides[side].pop();
            foundNeighbour = false;
            for (y in neighboursForX) {
              neighbourhood = neighboursForX[y];
              if (!neighboursForX.hasOwnProperty(y)) {
                continue;
              }
              if ((+y - h <= (_ref = p.y) && _ref <= +y + h)) {
                neighbourhood.push(p);
                foundNeighbour = true;
              }
            }
            if (!foundNeighbour) {
              neighboursForX[p.y] = [p];
            }
          }
          neighbours.push(neighboursForX);
        }
        return neighbours;
      };
      offset = function(neighboursForAbscissas) {
        var abs, n, neighbours, start, step, xNeighbours, y;
        step = 20;
        for (abs in neighboursForAbscissas) {
          xNeighbours = neighboursForAbscissas[abs];
          if (!neighboursForAbscissas.hasOwnProperty(abs)) {
            continue;
          }
          for (y in xNeighbours) {
            neighbours = xNeighbours[y];
            if (!xNeighbours.hasOwnProperty(y)) {
              continue;
            }
            n = neighbours.length;
            if (n === 1) {
              neighbours[0].labelOffset = 0;
              continue;
            }
            neighbours = neighbours.sort(function(a, b) {
              return a.y - b.y;
            });
            if (n % 2 === 0) {
              start = -(step / 2) * (n / 2);
            } else {
              start = -(n - 1) / 2 * step;
            }
            neighbours.forEach(function(neighbour, i) {
              return neighbour.labelOffset = start + step * i;
            });
          }
        }
      };
      offset(getNeighbours('left'));
      offset(getNeighbours('right'));
      return positions;
    }
  });

}).call(this);

//# sourceMappingURL=scrubber.js.map
