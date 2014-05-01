      drawLegend: (svg, series, dimensions) ->
        layout = [0]

        i = 1
        while i < series.length
          l = series[i - 1].label or series[i - 1].y
          layout.push @getTextWidth(l) + layout[i - 1] + 40
          i++


        that = this
        legend = svg.append('g').attr('class', 'legend')

        d = 16
        svg.select('defs').append('svg:clipPath')
          .attr('id', 'legend-clip')
          .append('circle').attr('r', d/2)

        item = legend.selectAll('.legendItem')
          .data(series)
          .enter().append('g')
            .attr(
              'class': 'legendItem'
              'transform': (s, i) -> "translate(#{layout[i]},#{dimensions.height-40})"
            )

        item.on('click', (s, i) ->
          d3.select(this).attr('opacity', if that.toggleSeries(svg, i) then '1' else '0.2')
        )

        item.append('circle')
          .attr(
            'fill': (s) -> s.color
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': d/2
          )

        item.append('path')
          .attr(
            'clip-path': 'url(#legend-clip)'
            'fill-opacity': (s) -> if s.type in ['area', 'column'] then '1' else '0'
            'fill': 'white'
            'stroke': 'white'
            'stroke-width': '2px'
            'd': (s) -> that.getLegendItemPath(s, d, d)
          )

        item.append('circle')
          .attr(
            'fill-opacity': 0
            'stroke': (s) -> s.color
            'stroke-width': '2px'
            'r': d/2
          )


        item.append('text')
          .attr(
            'font-family': 'monospace'
            'font-size': 10
            'transform': 'translate(13, 4)'
            'text-rendering': 'geometric-precision'
          )
          .text (s) -> s.label || s.y

        return this

      getLegendItemPath: (series, w, h) ->
        if series.type is 'column'
          path = 'M-' + w/3 + ' -' + h/8 + ' l0 ' + h + ' '
          path += 'M0' + ' -' + h/3 + ' l0 ' + h + ' '
          path += 'M' +w/3 + ' -' + h/10 + ' l0 ' + h + ' '

          return path

        base_path = 'M-' + w/2 + ' 0' + h/3 + ' l' + w/3 + ' -' + h/3 + ' l' + w/3 + ' ' +  h/3 + ' l' + w/3 + ' -' + 2*h/3

        base_path + ' l0 ' + h + ' l-' + w + ' 0z' if series.type is 'area'

        return base_path

      toggleSeries: (svg, index) ->
        isVisible = false

        svg.select('.content').selectAll('.series_' + index)
          .attr('opacity', (s) ->
            if d3.select(this).attr('opacity') is '0'
              isVisible = true
              return '1'

            isVisible = false
            return '0'
          )

        return isVisible
