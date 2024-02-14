const repository_API_URL = 'https://api.github.com/users/cypekdev/repos';
const github_repositories = document.querySelector('#github-repositories > div.container');

function setColumnLayout(numbers_of_children) {
  if (numbers_of_children % 3 === 1) {
    github_repositories.classList.add('two-column-layout')
  } else {
    github_repositories.classList.remove('two-column-layout')
  }
}

function renderRepos(repos, repos_languages = undefined) {

  let html_repos_section = ''

  setColumnLayout(repos.length)

  repos.forEach((repo, repo_index) => {

    const { url, name, description, created_at, updated_at } = repo
    const created_at_date = new Date(created_at).toLocaleDateString()
    const updated_at_date = new Date(updated_at).toLocaleDateString()

    html_repos_section +=
      `<a href="${url}" target="_blank" class="card">
        <div class="text-content">
          <h3>${name}</h3>
          <p>${description}</p>
          <div class="repos-dates">
            <div class="block">Data utworzenia:
              <span style="color: var(--text-color-3);">
                ${created_at_date}
              </span>
            </div>
            <div class="block">Data aktualizacji:
              <span style="color: var(--text-color-3);">
                ${updated_at_date}
              </span>
            </div>
          </div>
        </div>`

    if (Array.isArray(repos_languages) && repos_languages.length) {
      const repo_languages = repos_languages[repo_index]
      let sum_of_language_points = 0

      for (const repo_language_key in repo_languages) {
        sum_of_language_points += repo_languages[repo_language_key]
      }

      html_repos_section +=
        `<div class="languages">
          <span class="used-languages-graph">`

      for (const repo_language_key in repo_languages) {
        const repo_language_points = repo_languages[repo_language_key]

        html_repos_section +=
            `<span style="width: ${
              repo_language_points / sum_of_language_points * 100
            }%;"></span>`
      }
      
      html_repos_section +=
          `</span>
          <span class="used-languages-list">`

      for (const repo_language_key in repo_languages) {
        const repo_language_points = repo_languages[repo_language_key]

        html_repos_section +=
            `<span class="used-language-element">
              <span class="dot"></span>
              <span class="language-name">${repo_language_key}</span>
              <span class="language-usage-percentage">${
                (repo_language_points / sum_of_language_points * 100).toFixed(1)
              }%</span>
            </span>`
      }

      html_repos_section +=
          `</span>
        </div>`

    }

    html_repos_section +=
      `</a>`

  });

  github_repositories.innerHTML = html_repos_section
}


fetch(repository_API_URL)
  .then(resp => {
    if (!resp.ok)  throw new Error(`Network response was not ok! Code: ${resp.status}!`)
    else return resp;
  })
  .then(data_JSON => data_JSON.json()
    .then(data => data.map(data => {
      return {
        name:          data.name,
        description:   data.description,
        url:           data.html_url,
        created_at:    data.created_at,
        updated_at:    data.updated_at,
        languages_url: data.languages_url
      }
    }))
    .then(repos_data => {
      repos_data.sort((a, b) => {
        return Date.parse(b.updated_at) - Date.parse(a.updated_at);
      })  // sort descending by update date

      const fetch_langs_promises = repos_data.map(
        repo_data => fetch(repo_data.languages_url)
          .then(lang_data_JSON => lang_data_JSON.json())
      )

      Promise.all(fetch_langs_promises)
        .then(repos_langs_data => {
          renderRepos(repos_data, repos_langs_data)
          return repos_langs_data;
        })
        .catch(e => {
          console.error('Error:', e)
          renderRepos(repos_data)
        })
    })
    .catch(error => {
      github_repositories.innerHTML =
      `<a>
        <section class="tile">
          <h3>Błąd!</h3>
          <p>Przepraszamy, wystąpił błąd ładowania repozytoriów<p>
        </section>
      </a>`
      console.error('Wystąpił błąd:', error)
    })
  )
