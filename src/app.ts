import type { AudiotoolClient } from '@audiotool/nexus'

let allProjects: any[] = []

const searchEl = document.getElementById('search') as HTMLInputElement
const sortEl = document.getElementById('sort') as HTMLSelectElement
const listEl = document.getElementById('project-list') as HTMLDivElement
const loadingEl = document.getElementById('loading') as HTMLDivElement
const statusCount = document.getElementById('status-count') as HTMLSpanElement

export async function initApp(client: AudiotoolClient) {
  setupListeners()
  await loadProjects(client)
}

async function loadProjects(client: AudiotoolClient) {
  loadingEl.classList.remove('hidden')
  loadingEl.textContent = 'LADE PROJEKTE...'
  listEl.innerHTML = ''
  allProjects = []

  try {
    let pageToken: string | undefined = undefined
    let page = 0

    while (true) {
      const result: any = await client.api.projectService.listProjects(
        pageToken ? { pageToken } : {}
      )
      const projects = result.projects ?? []
      page++
      allProjects = [...allProjects, ...projects]
      loadingEl.textContent = `LADE SEITE ${page} — ${allProjects.length} PROJEKTE...`

      if (result.nextPageToken) {
        pageToken = result.nextPageToken
      } else {
        break
      }
    }

    render()
  } catch (e: any) {
    loadingEl.textContent = 'FEHLER: ' + (e?.message ?? 'unbekannt')
  } finally {
    loadingEl.classList.add('hidden')
  }
}

function getDisplayName(p: any): string {
  return p.displayName || p.trackName || p.name?.split('/').pop() || 'Unbenannt'
}

function getFiltered(): any[] {
  const query = searchEl.value.trim().toLowerCase()
  const sort = sortEl.value

  let list = [...allProjects]

  if (query) list = list.filter(p => getDisplayName(p).toLowerCase().includes(query))

  list.sort((a, b) => {
    const na = getDisplayName(a)
    const nb = getDisplayName(b)
    if (sort === 'name-asc') return na.localeCompare(nb)
    if (sort === 'name-desc') return nb.localeCompare(na)
    return 0
  })

  return list
}

function render() {
  const filtered = getFiltered()
  statusCount.textContent = `${filtered.length} VON ${allProjects.length} PROJEKTEN`

  listEl.innerHTML = ''

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty">KEINE PROJEKTE GEFUNDEN</div>'
    return
  }

  filtered.forEach(p => {
    const id = p.name?.split('/').pop() ?? p.id ?? ''
    const url = `https://beta.audiotool.com/studio?project=${id}`
    const item = document.createElement('a')
    item.className = 'project-item'
    item.href = url
    item.target = '_blank'
    item.rel = 'noopener noreferrer'

    const cover = document.createElement('div')
    cover.className = 'project-cover'
    if (p.coverUrl) {
      const img = document.createElement('img')
      img.src = p.coverUrl
      img.alt = getDisplayName(p)
      img.onerror = () => { cover.innerHTML = '♪' }
      cover.appendChild(img)
    } else {
      cover.textContent = '♪'
    }

    const name = document.createElement('div')
    name.className = 'project-name'
    name.textContent = getDisplayName(p)

    item.appendChild(cover)
    item.appendChild(name)
    listEl.appendChild(item)
  })
}

function setupListeners() {
  searchEl.addEventListener('input', render)
  sortEl.addEventListener('change', render)
}