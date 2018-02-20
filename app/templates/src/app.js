import DefineMap from 'can-define/map/';
import route from 'can-route';
import 'can-route-pushstate';
import 'can-debug#?./is-dev';

const AppViewModel = DefineMap.extend({
  env: {
    default: () => ({NODE_ENV:'development'}),
    serialize: false
  },
  message: {
    default: 'Hello World!',
    serialize: false
  },
  title: {
    default: '<%= name %>',
    serialize: false
  }
});

export default AppViewModel;
