import { DefineMap, route, RoutePushstate } from 'can';
import 'can-debug#?./is-dev';

route.urlData = new RoutePushstate();

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
