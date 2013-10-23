angular.module('demo.main', ['n3-charts.linechart', 'demo.examples'])

.config(['$routeProvider', function config($routeProvider) {
  $routeProvider
  .when('/examples', {controller: 'ExamplesCtrl', templateUrl: 'views/examples.html'})
  .when('/', {controller: 'HomeCtrl', templateUrl: 'views/home.html'})
  .otherwise({redirectTo: '/'});
}])

.controller('HomeCtrl', function($scope) {
  $scope.data = [
    {x: 0, y: 0, other_y: 0, val_2: 0, val_3: 0},
    {x: 1, y: 0.993, other_y: 3.894, val_2: 8.47, val_3: 14.347},
    {x: 2, y: 1.947, other_y: 7.174, val_2: 13.981, val_3: 19.991},
    {x: 3, y: 2.823, other_y: 9.32, val_2: 14.608, val_3: 13.509},
    {x: 4, y: 3.587, other_y: 9.996, val_2: 10.132, val_3: -1.167},
    {x: 5, y: 4.207, other_y: 9.093, val_2: 2.117, val_3: -15.136},
    {x: 6, y: 4.66, other_y: 6.755, val_2: -6.638, val_3: -19.923},
    {x: 7, y: 4.927, other_y: 3.35, val_2: -13.074, val_3: -12.625},
    {x: 8, y: 4.998, other_y: -0.584, val_2: -14.942, val_3: 2.331},
    {x: 9, y: 4.869, other_y: -4.425, val_2: -11.591, val_3: 15.873},
    {x: 10, y: 4.546, other_y: -7.568, val_2: -4.191, val_3: 19.787},
    {x: 11, y: 4.042, other_y: -9.516, val_2: 4.673, val_3: 11.698},
    {x: 12, y: 3.377, other_y: -9.962, val_2: 11.905, val_3: -3.487},
    {x: 13, y: 2.578, other_y: -8.835, val_2: 14.978, val_3: -16.557}
  ];

  $scope.options = {series: [
    {y: 'val_2', label: 'One', type: 'area', striped: true},
    {y: 'y', type: 'area', striped: true, label: 'Two'},
    {y: 'other_y', type: 'area', label: 'Three', striped: true}
  ], lineMode: 'cardinal'};
  
})

;