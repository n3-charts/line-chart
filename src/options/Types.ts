import * as d3 from 'd3';

export declare type stringCallback = d3.ValueFn<any, any, string>;
export declare type numberCallback = d3.ValueFn<any, any, number>;

export declare type condString = string | stringCallback;
export declare type condNumber = number | numberCallback;