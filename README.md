<p align='center'>
  <img src='/static/github-splash.png' alt='Metrodle' width='512' />
  <h2 align='center'>Wordle for Paris Metro stations</h2>
</p>
<p align='center'>
<p align='center'>
  <img src='https://img.shields.io/badge/BUN-F472B6?logo=bun&style=for-the-badge'>
  <img src="https://img.shields.io/badge/typescript-3178c6?logo=typescript&style=for-the-badge&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/svelte-F63B01?logo=svelte&style=for-the-badge&logoColor=white" alt="Svelte">
  <img src="https://img.shields.io/badge/sqlite-1179C8?logo=sqlite&style=for-the-badge&logoColor=white" alt="SQLite">
    <img src="https://img.shields.io/badge/OpenData%20IDFM-63B5F6?logo=iledefrancemobilites&logoColor=white&style=for-the-badge" alt="OpenData IDFM">
  <img src="https://img.shields.io/badge/eslint-4B32C3?logo=eslint&style=for-the-badge" alt="ESlint">
  <img src="https://img.shields.io/badge/prettier-1b2b35?logo=prettier&style=for-the-badge" alt="Prettier">
</p>
<p align="center"><em>This project is not affiliated with, endorsed by, or connected to RATP or Île-de-France Mobilités in any way.</em></p>

## About
This game is just like *Wordle*, but you guess Paris metro stations. Rather than letters, your hints are:
 - Lines
 - Town
 - Fare zone
 - Distance from objective


<p align='center'>
<a href="https://metrodle.leflon.fr">
  <img src="https://img.shields.io/badge/play%20now!-272f3b?style=for-the-badge&logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+" alt="Play now!">
</a>
</p>

## Installation
### Clone this repository
```bash
git clone https://github.com/leflon/metrodle
```
or
```
gh repo clone leflon/metrodle
```

### Install environment

This project was built **for Bun** and relies on `bun:sqlite` to work. 

*If you do not have Bun installed:*

**Linux & MacOS**
```bash
curl -fsSL https://bun.sh/install | bash
```
**Windows**
```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Install dependencies
```bash
bun install
```

### Fetch necessary data

This project relies on the **Ile-de-France Mobilités OpenData API** to retrieve all metro lines and stops data.

To populate your SQLite database with this data, run the **fetch.js** script:
```bash
bun fetch.js [--wipe|-w] [--local|-l]
```
**Arguments:**
 - `--wipe, -w`: Wipes the previous content of your database. By default, it will keep everything as it an only add new entries.
 - `--local, -l`: When you fetch from the OpenData, notice that you have three json files stored, corresponding to the plain downloaded data. To avoid remotely fetching everytime, by default, the script will use the local data to function.

### Start the dev environment
```bash
bun run dev
```

## Author
Paul Leflon