import DefineMap from 'can-define/map/';
import route from 'can-route';
import 'can-route-pushstate';

const AppViewModel = DefineMap.extend({
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
