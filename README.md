<p align="center"><img src="resources/peach-logo-128.png" alt="Peach" width="88"></p>

# Peach

A self-hosted video metadata manager for libraries that live in Google Drive or OneDrive.

[Website](https://peach.video) · [Download](#download-and-use) · [Live demo](https://demo.peach.video) · [Documentation](#documentation) · [简体中文](README.zh-CN.md)

[![Release](https://img.shields.io/github/v/release/peach-mitao/peach?include_prereleases&sort=semver&label=release&logo=github)](https://github.com/peach-mitao/peach/releases)
[![License](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue?logo=gnu&logoColor=white)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-image-2496ED?logo=docker&logoColor=white)](docs/DOCKER.md)
[![Age restrictions](https://img.shields.io/badge/age-18%2B-555555)](#license)

## Screenshots

[![Video library with search, filters and posters](https://peach.video/assets/screenshots/home-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/home-wide-20261025-2.png)

Movie demo data; see [asset credits and licenses](https://peach.video/en/credits/).

<details>
<summary>More screenshots</summary>

**People and works**

[![Charlie Chaplin's profile and films](https://peach.video/assets/screenshots/profile-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/profile-wide-20261025-2.png)

**Library statistics**

[![Library, storage and viewing statistics](https://peach.video/assets/screenshots/stats-wide-20261025-3-1280.webp)](https://peach.video/assets/screenshots/stats-wide-20261025-3.png)

**Player**

[![Big Buck Bunny player](https://peach.video/assets/screenshots/play-wide-20261025-2-1280.webp)](https://peach.video/assets/screenshots/play-wide-20261025-2.png)

</details>

## Features

- **Metadata scraping**: recognize video codes, read NFO files and fill titles, performers, studios and covers from multiple sources while keeping your edits.
- **Drive-backed library**: connect Google Drive and OneDrive, pick scan roots and browse what is there. Videos stay where they are; Peach keeps the metadata, thumbnails and watch history.
- **Playback**: play in the browser, or hand an expiring direct link to a desktop player. Resume position, playback speed and timeline previews are per title.
- **Change tracking**: a delta every 15 minutes and a full listing once a day keep the library current, and the settings page can refresh on demand.
- **Library explore**: read-only recommendations from your own library — titles you have not watched, or barely started.
- **Library management**: manage tags, duplicates, versions and parts; delete videos by performer while keeping profiles and photos.
- **Task center**: pause, resume or cancel background work and watch its progress and issues.

## Download and use

| Method | Get started |
| --- | --- |
| Docker / NAS | [Deployment guide](docs/DOCKER.md) |
| Source | [Setup instructions](docs/OPERATIONS.md); requires Git, uv and Python 3.14+ |

Peach runs as a single container or process against a data directory you own. After the first start, authorize a Google Drive or OneDrive account, choose the folders to scan, and the library fills itself.

OAuth clients are yours: register an application in Google Cloud or Azure and paste its client ID and secret, so access tokens stay under your control. See the [deployment guide](docs/DOCKER.md#网盘授权).

## Documentation

[Deployment](docs/DOCKER.md) · [Operations](docs/OPERATIONS.md) · [Metadata](docs/METADATA.md) · [External players](docs/EXTERNAL_PLAYERS.md) · [Diagnostics and data sharing](docs/DIAGNOSTICS.md) · [Changelog](CHANGELOG.md)

Development: [Contributing](CONTRIBUTING.md) · [Development guide](AGENTS.md) · [Testing](docs/TESTING.md)

## Reporting problems

[Report a bug or suggest a feature](https://github.com/peach-mitao/peach/issues/new/choose) with your version, steps and error message. Use demo data in public screenshots and redact private information; do not upload videos or databases. Report vulnerabilities privately through the [security policy](SECURITY.md).

## Related projects

Thanks to [amane](https://github.com/sqzw-x/amane) and [Gfriends](https://github.com/gfriends/gfriends). See the [reuse inventory](docs/REUSE.md) for full credits.

## Star History

<a href="https://github.com/peach-mitao/peach/tree/star-history">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-light.svg">
    <img alt="Peach cumulative stars, linear scale" src="https://raw.githubusercontent.com/peach-mitao/peach/star-history/star-history-light.svg">
  </picture>
</a>

## License

[AGPL-3.0-or-later](LICENSE) · Copyright (C) 2026 The Peach contributors. Third-party components retain their own licenses. Use of the Peach name and logo follows the [name and logo policy](docs/TRADEMARKS.md).

Manage only media you own or are authorized to use, subject to laws, copyright and source-platform access, age and regional restrictions. Peach does not provide video resources or access to paid content.
