      getEventDispatcher: () ->
        
        events = [
          'focus',
          'hover',
          'click',
          'toggle'
        ]

        return d3.dispatch.apply(this, events)