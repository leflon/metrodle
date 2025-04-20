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
1. Clone this repository
```bash
git clone https://github.com/leflon/metrodle
```
or
```
gh repo clone leflon/metrodle
```
2. Install dependencies

This project was made for bun. You can totally run it on Node.js and *probably* Deno, but you will need to change some `package.json` scripts beforehand.
```bash
bun install
```
3. Start the dev environment
```bash
bun run dev
```

