import * as d3 from 'd3';

export class Interpolation {

  // TODO add curveBundle which, for some reason, TS doesn't like
  public static interpolations: { [id: string] : d3.CurveFactory } = {
    'linear': d3.curveLinear,
    'linear-closed': d3.curveLinearClosed,
    'step': d3.curveStep,
    'step-before': d3.curveStepBefore,
    'step-after': d3.curveStepAfter,
    'basis': d3.curveBasis,
    'basis-open': d3.curveBasisOpen,
    'basis-closed': d3.curveBasisClosed,
    'cardinal': d3.curveCardinal,
    'cardinal-open': d3.curveCardinalOpen,
    'cardinal-closed': d3.curveCardinalClosed,
    'monotone': d3.curveMonotoneX
  };

  public static getInterpolation(id: string, tension: number): d3.CurveFactory {
    var interpolation = this.interpolations[id];

    if (interpolation['tension']) interpolation = interpolation['tension'](tension);

    return interpolation;
  }
}
