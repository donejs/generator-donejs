import { fixture } from 'can';
import <%= className %> from '../<%= name %>';

const store = fixture.store([{
  <%= idProp %>: 0,
  description: 'First item'
}, {
  <%= idProp %>: 1,
  description: 'Second item'
}], <%= className %>.connection.queryLogic);

fixture('<%= url %>/{<%= idProp %>}', store);

export default store;
