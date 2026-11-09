export const number = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}
export const money = (value, compact = false) => compact
  ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', notation: 'compact', maximumFractionDigits: 2 }).format(value)
  : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
export const itemName = (item) => item.For.trim()
export const metrics = (items = []) => {
  const total = items.reduce((sum, item) => sum + number(item['To Give']), 0)
  const given = items.reduce((sum, item) => sum + number(item['Amount Given']), 0)
  const remaining = items.reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const monthly = items.reduce((sum, item) => sum + number(item['Monthly Release']), 0)
  const totalSavings = items.filter(item => item.Essense === 'Store' && item.Type === 'Saving')
    .reduce((sum, item) => sum + number(item['Amount Given']), 0)
  const totalNonCibilRemainingReturn = items.filter(item => item.Type === 'NonCIBILReturn')
    .reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const totalCibilRemainingReturn = items.filter(item => item.Type === 'CIBILReturn')
    .reduce((sum, item) => sum + number(item['Amount Remain']), 0)
  const monthlyRelease = items.filter(item => item.Essense === 'Release')
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
