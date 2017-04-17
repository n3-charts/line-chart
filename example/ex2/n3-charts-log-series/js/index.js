angular.module('example', ['n3-line-chart'])
.controller('ExampleCtrl', function($scope) {
 // Due to CodePen's API, it's not possible to include functions in dynamic CodePen's such as this one, therefore some closures might be missing (the axes' formatting functions, for example) and need to be added manually. Thanks ! :-)
  $scope.data = [
    {
    x: 0,
    val_0: 300000,
    val_1: 400000,
    val_2: 500000,
    val_3: 600000
  },
  {
    x: 1,
    val_0: 208060,
    val_1: 308060,
    val_2: 408060,
    val_3: 508060
  },
  {
    x: 2,
    val_0: 16771,
    val_1: 116771,
    val_2: 216771,
    val_3: 316771
  },
  {
    x: 3,
    val_0: 97998,
    val_1: 2002,
    val_2: 102002,
    val_3: 202002
  },
  {
    x: 4,
    val_0: 30728,
    val_1: 69272,
    val_2: 169272,
    val_3: 269272
  },
  {
    x: 5,
    val_0: 156732,
    val_1: 256732,
    val_2: 356732,
    val_3: 456732
  },
  {
    x: 6,
    val_0: 292034,
    val_1: 392034,
    val_2: 492034,
    val_3: 592034
  },
  {
    x: 7,
    val_0: 250780,
    val_1: 350780,
    val_2: 450780,
    val_3: 550780
  },
  {
    x: 8,
    val_0: 70900,
    val_1: 170900,
    val_2: 270900,
    val_3: 370900
  },
  {
    x: 9,
    val_0: 82226,
    val_1: 17774,
    val_2: 117774,
    val_3: 217774
  },
  {
    x: 10,
    val_0: 67814,
    val_1: 32186,
    val_2: 132186,
    val_3: 232186
  },
  {
    x: 11,
    val_0: 100885,
    val_1: 200885,
    val_2: 300885,
    val_3: 400885
  },
  {
    x: 12,
    val_0: 268770,
    val_1: 368770,
    val_2: 468770,
    val_3: 568770
  },
  {
    x: 13,
    val_0: 281489,
    val_1: 381489,
    val_2: 481489,
    val_3: 581489
  },
  {
    x: 14,
    val_0: 127347,
    val_1: 227347,
    val_2: 327347,
    val_3: 427347
  },
  {
    x: 15,
    val_0: 51937,
    val_1: 48063,
    val_2: 148063,
    val_3: 248063
  },
  {
    x: 16,
    val_0: 91531,
    val_1: 8469,
    val_2: 108469,
    val_3: 208469
  },
  {
    x: 17,
    val_0: 44968,
    val_1: 144968,
    val_2: 244968,
    val_3: 344968
  },
  {
    x: 18,
    val_0: 232063,
    val_1: 332063,
    val_2: 432063,
    val_3: 532063
  },
  {
    x: 19,
    val_0: 297740,
    val_1: 397740,
    val_2: 497740,
    val_3: 597740
  },
  {
    x: 20,
    val_0: 181616,
    val_1: 281616,
    val_2: 381616,
    val_3: 481616
  },
  {
    x: 21,
    val_0: 9545,
    val_1: 90455,
    val_2: 190455,
    val_3: 290455
  },
  {
    x: 22,
    val_0: 99992,
    val_1: 8,
    val_2: 100008,
    val_3: 200008
  },
  {
    x: 23,
    val_0: 6566,
    val_1: 93434,
    val_2: 193434,
    val_3: 293434
  },
  {
    x: 24,
    val_0: 184835,
    val_1: 284835,
    val_2: 384835,
    val_3: 484835
  },
  {
    x: 25,
    val_0: 298240,
    val_1: 398240,
    val_2: 498240,
    val_3: 598240
  },
  {
    x: 26,
    val_0: 229383,
    val_1: 329383,
    val_2: 429383,
    val_3: 529383
  },
  {
    x: 27,
    val_0: 41573,
    val_1: 141573,
    val_2: 241573,
    val_3: 341573
  },
  {
    x: 28,
    val_0: 92521,
    val_1: 7479,
    val_2: 107479,
    val_3: 207479
  },
  {
    x: 29,
    val_0: 49611,
    val_1: 50389,
    val_2: 150389,
    val_3: 250389
  }
];

  $scope.options = {
  axes: {
    x: {
      key: "x"
    },
    y: {
      type: "log"
    }
  },
  series: [
    {
      y: "val_0",
      label: "Batmaaan",
      color: "#d62728"
    }
  ]
};
  
});