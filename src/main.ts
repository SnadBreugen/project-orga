import { getLoginStatus, createAudiotoolClient } from '@audiotool/nexus'
import { initApp } from './app'

const CLIENT_ID = '9ab9862f-48c5-40ae-9b7f-8246d02bd2f9'
const REDIRECT_URL = 'http://127.0.0.1:5173/project-orga/'
const SCOPE = 'user:read project:read'

const btnLoginHeader = document.getElementById('btn-login') as HTMLButtonElement
const btnLoginMain = document.getElementById('btn-login-main') as HTMLButtonElement
const screenLogin = document.getElementById('screen-login') as HTMLDivElement
const screenApp = document.getElementById('screen-app') as HTMLDivElement
const usernameEl = document.getElementById('username') as HTMLSpanElement
const statusDot = document.getElementById('status-dot') as HTMLDivElement

let loginStatus: Awaited<ReturnType<typeof getLoginStatus>> | null = null

async function init() {
  loginStatus = await getLoginStatus({ clientId: CLIENT_ID, redirectUrl: REDIRECT_URL, scope: SCOPE })

  if (loginStatus.loggedIn) {
    const username = await loginStatus.getUserName()
    showApp(username ?? 'sandburgen')
    const client = await createAudiotoolClient({ authorization: loginStatus })
    await initApp(client)
  } else {
    showLogin()
  }
}

function showLogin() {
  screenLogin.classList.remove('hidden')
  screenApp.classList.add('hidden')
  statusDot.className = 'dot dot--off'
  btnLoginHeader.textContent = 'LOGIN'
}

function showApp(username: string) {
  screenLogin.classList.add('hidden')
  screenApp.classList.remove('hidden')
  statusDot.className = 'dot dot--on'
  usernameEl.textContent = username
  btnLoginHeader.textContent = 'LOGOUT'
}

function triggerLogin() {
  if (loginStatus && !loginStatus.loggedIn) {
    loginStatus.login()
  }
}

function triggerLogout() {
  if (loginStatus && loginStatus.loggedIn) {
    loginStatus.logout()
  }
}

btnLoginHeader.addEventListener('click', () => {
  if (btnLoginHeader.textContent === 'LOGOUT') {
    triggerLogout()
  } else {
    triggerLogin()
  }
})

btnLoginMain.addEventListener('click', triggerLogin)

init()