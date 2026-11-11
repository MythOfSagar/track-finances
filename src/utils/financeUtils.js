export const number = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}
export const money = (value, compact = false) => compact
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 2 }).format(value)
  : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
export const moneyPrecise = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value)
export const itemName = (item) => item.For.trim()
const releaseEndDatePassed = (item, now) => {
  const date = String(item.Date || '').trim()
  const endText = date.includes('_to_') ? date.split('_to_').at(-1) : date
  if (/^12\/99$/.test(endText)) return true
  const end = parseMonth(endText)
  if (!end) return false
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(end.year, end.month - 1, 1) > currentMonth
}
export const metrics = (items = [], now = new Date()) => {
  const total = items.reduce((sum, item) => sum + number(item['To Give']), 0)
  const given = items.reduce((sum, item) => sum + number(item['Amount Given']), 0)
  const remaining = items.reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const monthly = items.reduce((sum, item) => sum + (item.Essense === 'Release' && !releaseEndDatePassed(item, now) ? 0 : number(item['Monthly Release'])), 0)
  const totalSavings = items.filter(item => item.Essense === 'Store' && item.Type === 'Saving')
    .reduce((sum, item) => sum + number(item['Amount Given']), 0)
  const totalNonCibilRemainingReturn = items.filter(item => item.Type === 'NonCIBILReturn')
    .reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const totalCibilRemainingReturn = items.filter(item => item.Type === 'CIBILReturn')
    .reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const monthlyRelease = items.filter(item => item.Essense === 'Release' && releaseEndDatePassed(item, now))
    .reduce((sum, item) => sum + number(item['Monthly Release']), 0)
  const completed = items.filter(item => number(item['Amount Remain']) === 0).length
  return {
    total,
    given,
    remaining,
    monthly,
    monthlyRelease,
    totalSavings,
    totalNonCibilRemainingReturn,
    totalCibilRemainingReturn,
    savingsAfterCibilDebt: totalSavings - totalCibilRemainingReturn,
    savingsAfterNonCibilDebt: totalSavings - totalNonCibilRemainingReturn,
    realCurrentTotal: totalSavings - totalCibilRemainingReturn - totalNonCibilRemainingReturn,
    securedMonths: monthlyRelease > 0 ? totalSavings / monthlyRelease : null,
    netSecuredMonths: monthlyRelease > 0 ? (totalSavings - totalNonCibilRemainingReturn) / monthlyRelease : null,
    completed,
    percent: total ? given / total * 100 : 0,
  }
}
export const typeLabels = { Spending: 'Spending', NonCIBILReturn: 'Non-CIBIL return', CIBILReturn: 'CIBIL return / loan', Saving: 'Savings' }
export const categoryMetrics = (type, items = []) => metrics(items.filter(item => item.Type === type))
export const monthsLabel = (value) => value ? `${value} mo` : 'Not specified'

const parseMonth = (value) => {
  const match = String(value || '').trim().match(/^(\d{1,2})\/(\d{2}|\d{4})$/)
  if (!match) return null
  const month = Number(match[1])
  let year = Number(match[2])
  if (month < 1 || month > 12) return null
  if (year < 100) year += year >= 70 ? 1900 : 2000
  return { year, month }
}
export const spendingTimeline = (items = [], grouping = 'month', now = new Date(), rangeStart = '', rangeEnd = '') => {
  const totals = new Map()
  const current = new Date(now.getFullYear(), now.getMonth(), 1)
  const add = (date, amount, item) => {
    const key = grouping === 'year' ? String(date.getFullYear()) : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const bucket = totals.get(key) || { value: 0, items: new Map() }
    const name = itemName(item)
    bucket.value += amount
    bucket.items.set(name, (bucket.items.get(name) || 0) + amount)
    totals.set(key, bucket)
  }
  items.forEach(item => {
    const date = String(item.Date || '').trim()
    if (!date) return
    const subscription = String(item['Is Subscription'] || '').trim().toLowerCase() === 'true'
    if (date.includes('_to_')) {
      const [startText, endText] = date.split('_to_')
      const start = parseMonth(startText)
      const end = parseMonth(endText)
      if (!start) return
      const first = new Date(start.year, start.month - 1, 1)
      const openEnded = /^12\/99$/.test(String(endText || '').trim())
      const requestedLast = end && !openEnded ? new Date(end.year, end.month - 1, 1) : current
      const last = requestedLast > current ? current : requestedLast
      const count = (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth() + 1
      if (count <= 0 || count > 1200) return
      const perMonth = subscription ? number(item['Monthly Release']) : number(item['To Give']) / count
      for (let index = 0; index < count; index++) add(new Date(first.getFullYear(), first.getMonth() + index, 1), perMonth, item)
      return
    }
    const month = parseMonth(date)
    if (month) {
      const purchaseMonth = new Date(month.year, month.month - 1, 1)
      if (purchaseMonth <= current) add(purchaseMonth, subscription ? number(item['Monthly Release']) : number(item['To Give']), item)
    }
  })
  if (!totals.size) return []
  const keys = [...totals.keys()].sort()
  const toPoint = (label, bucket) => ({ label, value: bucket.value, items: [...bucket.items].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value) })
  const parseRange = (value) => {
    const match = String(value || '').match(/^(\d{4})-(\d{2})$/)
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, 1) : null
  }
  const selectedStart = parseRange(rangeStart)
  const selectedEnd = parseRange(rangeEnd)
  if (grouping === 'year') {
    const firstYear = Number(keys[0])
    return Array.from({ length: current.getFullYear() - firstYear + 1 }, (_, index) => {
      const year = String(firstYear + index)
      return toPoint(year, totals.get(year) || { value: 0, items: new Map() })
    }).filter(point => {
      const year = Number(point.label)
      const firstMonth = new Date(year, 0, 1)
      const lastMonth = new Date(year, 11, 1)
      return (!selectedStart || lastMonth >= selectedStart) && (!selectedEnd || firstMonth <= selectedEnd)
    })
  }
  const [firstYear, firstMonth] = keys[0].split('-').map(Number)
  const rows = []
  for (let date = new Date(firstYear, firstMonth - 1, 1); date <= current; date.setMonth(date.getMonth() + 1)) {
    if ((selectedStart && date < selectedStart) || (selectedEnd && date > selectedEnd)) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    rows.push(totals.has(key)
      ? toPoint(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), totals.get(key))
      : { label: date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), value: 0, items: [] })
  }
  return rows
}
