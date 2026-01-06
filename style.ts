const STORAGE_KEY = 'todos-v1';

const dom = {
  form: document.getElementById('todo-form'),
  input: document.getElementById('todo-input'),
  list: document.getElementById('todo-list'),
  itemsLeft: document.getElementById('items-left'),
  filters: document.querySelectorAll('.filter'),
  clearBtn: document.getElementById('clear-completed'),
};

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let activeFilter = 'all';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function render() {
  dom.list.innerHTML = '';
  const filtered = todos.filter(t => activeFilter === 'all' || (activeFilter === 'active' && !t.completed) || (activeFilter === 'completed' && t.completed));
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.completed ? ' completed' : '');
    li.dataset.id = t.id;
    li.innerHTML = `
      <button class="toggle" aria-label="Toggle complete">${t.completed ? '✓' : ''}</button>
      <div class="text" tabindex="0">${escapeHtml(t.text)}</div>
      <button class="delete" aria-label="Delete">✕</button>
    `;
    dom.list.appendChild(li);
  });
  dom.itemsLeft.textContent = `${todos.filter(t => !t.completed).length} items left`;
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  todos.unshift({ id: Date.now().toString(), text: trimmed, completed: false });
  save(); render();
}

function toggleTodo(id) {
  const t = todos.find(x => x.id === id);
  if (t) { t.completed = !t.completed; save(); render(); }
}

function deleteTodo(id) {
  todos = todos.filter(x => x.id !== id);
  save(); render();
}

function editTodo(id, newText) {
  const t = todos.find(x => x.id === id);
  if (t) { t.text = newText.trim() || t.text; save(); render(); }
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save(); render();
}

/* Events */
dom.form.addEventListener('submit', e => {
  e.preventDefault();
  addTodo(dom.input.value);
  dom.input.value = '';
});

dom.list.addEventListener('click', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  if (e.target.classList.contains('toggle')) toggleTodo(id);
  if (e.target.classList.contains('delete')) deleteTodo(id);
});

dom.list.addEventListener('dblclick', e => {
  const li = e.target.closest('.todo-item');
  if (!li) return;
  const id = li.dataset.id;
  const textDiv = li.querySelector('.text');
  const input = document.createElement('input');
  input.value = textDiv.textContent;
  input.className = 'edit-input';
  li.replaceChild(input, textDiv);
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);

  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { editTodo(id, input.value); }
    if (ev.key === 'Escape') render();
  });

  input.addEventListener('blur', () => editTodo(id, input.value));
});

dom.filters.forEach(btn => btn.addEventListener('click', () => {
  dom.filters.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  render();
}));

dom.clearBtn.addEventListener('click', clearCompleted);

/* Initial render */
render();