import './style.css'
// TODO consider lazy loading later
import data from './dict.json'

const input = document.querySelector('#autocomplete-input');
const list = document.querySelector('#suggestions-list');


input.addEventListener('input', (e) => {
  const value = e.target.value;
  const filteredList = data.filter(d => d.includes(value))
  list.style.display = 'block'; 

  while(list.firstChild) {
    list.removeChild(list.firstChild);
  }

  for (const e of filteredList) {
    const node = document.createElement('li');
    node.innerText = e;
    list.appendChild(node)
  }
});





