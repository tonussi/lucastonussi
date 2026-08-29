// Demo auto-login: first-time anonymous visitors often hesitate on the login
// screen because they don't know which credentials to use. After a short idle
// delay we type a random demo e-mail for them and sign them in.

const AUTO_LOGIN_KEY = 'demo_auto_login_done'

export const AUTO_LOGIN_DELAY_MS = 5000
export const AUTO_LOGIN_TYPING_MS = 55

const NAMES = [
  'alex',
  'bruna',
  'carlos',
  'dani',
  'erica',
  'felipe',
  'gabi',
  'hugo',
  'iris',
  'joao',
  'lia',
  'marcos',
  'nina',
  'otavio',
  'paula',
  'rafa',
  'sofia',
  'tiago',
  'vitor',
  'yuri',
]

const DOMAINS = ['example.com', 'demo.dev', 'mail.test', 'visitor.app']

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function generateRandomEmail(): string {
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${pick(NAMES)}.${suffix}@${pick(DOMAINS)}`
}

export function generateRandomPassword(): string {
  return Math.random().toString(36).slice(2, 12)
}

export function hasAutoLoggedIn(): boolean {
  try {
    return localStorage.getItem(AUTO_LOGIN_KEY) === 'true'
  } catch {
    // Storage blocked (private mode, cookies disabled): skip the demo instead
    // of replaying it on every visit.
    return true
  }
}

export function markAutoLoggedIn(): void {
  try {
    localStorage.setItem(AUTO_LOGIN_KEY, 'true')
  } catch {
    // Ignore: worst case the demo runs again on the next visit.
  }
}
