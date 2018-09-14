import { DefineMap, route, RoutePushstate } from 'can';
import 'can-debug#?./is-dev';

const AppViewModel = DefineMap.extend({
  env: {
    default: () => ({NODE_ENV:'development'})
  },
  title: {
    default: '<%= name %>'
  }
  routeData: {
    default: () => route.data
  }
});

route.urlData = new RoutePushstate();
route.register("{page}", { page: "home" });

export default AppViewModel;
