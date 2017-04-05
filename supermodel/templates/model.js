import DefineList from 'can-define/list/';
import DefineMap from 'can-define/map/';
import loader from '@loader';
import set from 'can-set';
import superMap from 'can-connect/can/super-map/';

const algebra = new set.Algebra(
  set.props.id('<%= idProp %>')
);

const <%= className %> = DefineMap.extend({
  seal: false
}, {
  '<%= idProp %>': 'any'
});

<%= className %>.List = DefineList.extend({
  '#': <%= className %>
});

<%= className %>.connection = superMap({
  url: loader.serviceBaseURL + '<%= url %>',
  name: '<%= name %>',
  Map: <%= className %>,
  List: <%= className %>.List,
  algebra
});

export default <%= className %>;
