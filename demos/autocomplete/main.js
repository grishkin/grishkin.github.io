import './style.css'
// TODO consider lazy loading later
import data from './dict.json'

const input = document.querySelector('#autocomplete-input');
const list = document.querySelector('#suggestions-list');

input.addEventListener('input', (e) => {
  const value = e.target.value;
  console.log('Input:', value);
  // TODO: Implement autocomplete logic
});



