import { DefineMap, DefineList, superModel } from 'can';
import loader from '@loader';

const <%= className %> = DefineMap.extend('<%= className %>', {
  seal: false
}, {
  '<%= idProp %>': {
    type: 'any',
    identity: true
  }
});

<%= className %>.List = DefineList.extend('<%= className %>List', {
  '#': <%= className %>
});

<%= className %>.connection = superModel({
  url: loader.serviceBaseURL + '<%= url %>',
  Map: <%= className %>,
  List: <%= className %>.List,
  name: '<%= name %>'
});

export default <%= className %>;
