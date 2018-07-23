import { Component, DefineMap } from 'can';
import './<%= name %>.less';
import view from './<%= name %>.stache';

export const ViewModel = DefineMap.extend({
  message: {
    default: 'This is the <%= tag %> component'
  }
});

export default Component.extend({
  tag: '<%= tag %>',
  ViewModel,
  view
});
