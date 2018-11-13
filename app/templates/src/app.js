import { DefineMap, route } from 'can';
import RoutePushstate from 'can-route-pushstate';
import debug from 'can-debug#?./is-dev';

//!steal-remove-start
if(debug) {
	debug();
}
//!steal-remove-end

const AppViewModel = DefineMap.extend("AppViewModel", {
  env: {
    default: () => ({NODE_ENV:'development'})
  },
  title: {
    default: '<%= name %>'
  },
  routeData: {
    default: () => route.data
  }
});

route.urlData = new RoutePushstate();
route.register("{page}", { page: "home" });

export default AppViewModel;
