const STORAGE_KEY = 'income_expense_entries_v1'
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const totalIncomeEl = document.getElementById('total-income')
const totalExpensesEl = document.getElementById('total-expenses')
const netBalanceEl = document.getElementById('net-balance')
const entriesListEl = document.getElementById('entries-list')
const emptyEl = document.getElementById('empty')
const descInput = document.getElementById('desc')
const amountInput = document.getElementById('amount')
const submitBtn = document.getElementById('submit-btn')
const resetBtn = document.getElementById('reset-btn')
const aboutBtn = document.getElementById('about-btn')
const aboutEl = document.getElementById('about')
let isEditing = false
let editId = null

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function formatMoney(value) {
  const n = Number(value || 0)
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function calculateTotals() {
  let income = 0
  let expenses = 0
  for (const item of entries) {
    if (item.type === 'income') income += Number(item.amount)
    else expenses += Number(item.amount)
  }
  const net = income - expenses
  totalIncomeEl.textContent = formatMoney(income)
  totalExpensesEl.textContent = formatMoney(expenses)
  netBalanceEl.textContent = formatMoney(net)
  netBalanceEl.classList.remove('text-green-500', 'text-red-500')
  if (net > 0) netBalanceEl.classList.add('text-green-500')
  else if (net < 0) netBalanceEl.classList.add('text-red-500')
}

function renderEntries() {
  const filter = document.querySelector('input[name="filter"]:checked').value
  const filtered = entries.filter(e => filter === 'all' ? true : e.type === filter)
  entriesListEl.innerHTML = ''
  if (filtered.length === 0) {
    emptyEl.style.display = 'block'
    return
  } else {
    emptyEl.style.display = 'none'
  }
  for (const item of filtered) {
    const row = document.createElement('div')
    row.className = 'py-3 flex items-center justify-between gap-4'
    const left = document.createElement('div')
    left.className = 'flex items-start gap-3'
    const badge = document.createElement('div')
    badge.className = item.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
    badge.textContent = item.type === 'income' ? '+' : '-'
    const meta = document.createElement('div')
    const title = document.createElement('div')
    title.className = 'font-medium'
    title.textContent = item.description
    const date = document.createElement('div')
    date.className = 'text-sm text-gray-400'
    date.textContent = new Date(item.date).toLocaleString()
    meta.appendChild(title)
    meta.appendChild(date)
    left.appendChild(badge)
    left.appendChild(meta)
    const right = document.createElement('div')
    right.className = 'flex items-center gap-3'
    const amt = document.createElement('div')
    amt.className = item.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'
    amt.textContent = (item.type === 'income' ? '+' : '-') + formatMoney(item.amount).slice(1)
    const editBtn = document.createElement('button')
    editBtn.className = 'px-3 py-1 rounded-md border border-gray-200 text-sm'
    editBtn.innerHTML = 'Edit'
    editBtn.addEventListener('click', () => startEdit(item.id))
    const delBtn = document.createElement('button')
    delBtn.className = 'px-3 py-1 rounded-md border border-gray-200 text-sm'
    delBtn.innerHTML = 'Delete'
    delBtn.addEventListener('click', () => removeEntry(item.id))
    right.appendChild(amt)
    right.appendChild(editBtn)
    right.appendChild(delBtn)
    row.appendChild(left)
    row.appendChild(right)
    entriesListEl.appendChild(row)
  }
}

function startEdit(id) {
  const item = entries.find(e => e.id === id)
  if (!item) return
  descInput.value = item.description
  amountInput.value = item.amount
  const typeRadio = document.querySelector(`input[name="type"][value="${item.type}"]`)
  if (typeRadio) typeRadio.checked = true
  isEditing = true
  editId = id
  submitBtn.textContent = 'Update Entry'
  submitBtn.classList.remove('bg-indigo-600')
  submitBtn.classList.add('bg-yellow-600')
}

function removeEntry(id) {
  entries = entries.filter(e => e.id !== id)
  saveEntries()
  calculateTotals()
  renderEntries()
}

function resetForm() {
  descInput.value = ''
  amountInput.value = ''
  const incomeRadio = document.querySelector('input[name="type"][value="income"]')
  if (incomeRadio) incomeRadio.checked = true
  isEditing = false
  editId = null
  submitBtn.textContent = 'Add Entry'
  submitBtn.classList.remove('bg-yellow-600')
  submitBtn.classList.add('bg-indigo-600')
}

function handleSubmit(e) {
  e.preventDefault()
  const description = descInput.value.trim()
  const amount = Number(amountInput.value)
  const type = document.querySelector('input[name="type"]:checked').value
  if (!description || !amount) return
  if (isEditing && editId) {
    const idx = entries.findIndex(x => x.id === editId)
    if (idx > -1) {
      entries[idx].description = description
      entries[idx].amount = Math.abs(amount)
      entries[idx].type = type
      entries[idx].date = Date.now()
    }
    isEditing = false
    editId = null
  } else {
    const newEntry = { id: Date.now().toString(), description, amount: Math.abs(amount), type, date: Date.now() }
    entries.unshift(newEntry)
  }
  saveEntries()
  calculateTotals()
  renderEntries()
  resetForm()
}

document.getElementById('entry-form').addEventListener('submit', handleSubmit)
resetBtn.addEventListener('click', resetForm)
aboutBtn.addEventListener('click', () => { aboutEl.classList.toggle('hidden') })
const filterRadios = document.querySelectorAll('input[name="filter"]')
filterRadios.forEach(r => r.addEventListener('change', () => { renderEntries() }))

calculateTotals()
renderEntries()