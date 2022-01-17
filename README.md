# Shabad OS Database

A digital representation of Sikh Bani and other Panthic texts with a public logbook of sangat-sourced corrections.

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]

## Overview

>Please note that work has begun on the [next major version of Shabad OS Database](https://github.com/shabados/database). This branch is still getting proofreading corrections and can be used for apps, but if you are planning on contributing/development, please see the "next" branch of this repo.

- Open-source
  - Content, history, and modifications are publicly accessible
  - Transparency through open-source is more accountable (i.e. anyone can verify integrity)
  - Duplication of effort among different parties is reduced
  - Sustainability and longevity of project is improved
- Quality / Accuracy
  - Backed by real, physical sources (no controversy)
  - Digitally represents what was written/printed
  - Photographic evidence continuously reviewed for accuracy
  - Multiple sources used to digitize gurbani, panthic texts, language translations, and exegesis
- Modern database schema
  - Designed to capture data effectively
  - Ideal for developing apps, analyzing data, or undertaking research
- API
  - The `@shabados/database` npm JS package can query the database without SQL

## Install

There are 2 officially supported release formats (SQLite and npm), and a REST API provided by GurbaniNow. [Please our docs article](https://docs.shabados.com/database/installing-or-accessing).

If you'd like to read about the schema, [please see here](https://docs.shabados.com/database/schema/overview).

Lastly, please [see our technical article](https://docs.shabados.com/database/usage) on using SQLite querying or the JS API.

## Community

Get updates on Shabad OS and chat with the project maintainers and community members.

- [![Instagram][instagram-image]][instagram-url] Follow Shabad OS on Instagram
- [![Twitter][twitter-image]][twitter-url] Follow Shabad OS on Twitter.
- [![Chat][chat-image]][chat-url] Join the official Slack channel.

## Contributing

If you're non-technical, learn how to review physical sources and compare them to what has been digitized. [Learn more about proofreading >](https://docs.shabados.com/viewer/guides/proofreading)

If you're interested in contributing to the source code of Database, then please view the "next" branch of this repo.

## People

The original code was written by the current lead maintainer, Harjot Singh ([@harjot1singh](https://github.com/harjot1singh)).

"Thank you!" to [all the volunteers][contributor-url] who've contributed to Database.

## Feedback

- Ask questions and get help in our community chat via [Slack][chat-url]
- Follow [@shabad_os on Instagram](instagram-url) and [@shabad_os on Twitter](twitter-url) and let us know what you think!

## Related Projects

Projects in the Shabad OS ecosystem of free and open source software include:

- [Viewer](https://github.com/shabados/viewer)
- [Presenter](https://github.com/shabados/presenter)
- [Mobile](https://github.com/shabados/mobile)
- [Gurmukhi Utils](https://github.com/shabados/gurmukhi-utils)

## Code of Conduct

Please note that this project is released under the Contributor Covenant. By participating in this project you agree to abide by its terms. Our intention is to signal a safe open-source community by welcoming all people to contribute, and pledging in return to value them as whole human beings and to foster an atmosphere of kindness, cooperation, and understanding.

> We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.
>
> We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.
>
> [The Contributor Covenant][contributor-covenant-url]

## License

**NOTE**: Applies to code and content resting outside of the `data` folder.

This project is under v3 of the [GPL](LICENSE.md). It is similar to the Golden Rule: do unto others as you would have them do unto you. In exchange for benefitting from the work completed in this repo, others must share their derivative work under v3 of the [GPL](LICENSE.md).

> This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
>
> This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
>
> You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## Gurbani and Panthic Compositions

**NOTE**: Applies to different texts inside the `data` folder, generated inside the `build` folder, and as releases (e.g. GitHub, npm).

As typical of many old, historical works, most gurbani and panthic texts are free of known copyright restrictions. We identify it as being in the [public domain](https://creativecommons.org/publicdomain/mark/1.0/) as a work of factual compilation with originality. The honor and reputation of the original works are to be maintained. Derogatory treatments (including adding to, deleting from, altering of, or adapting) the words in a way that distorts or mutilates the original work is forbidden. That is why, whenever possible, physical sources are used to determine the digital representation of these works as to avoid any controversy.

Please see our article on [Source Material](https://docs.shabados.com/database/source-material) for our list of official sources.

## Acknowledgments

**NOTE**: If we have missed any attribution, credits, or copyrights, please [let us know][new-issue-url] or fork this repo and submit a [pull request](CONTRIBUTING.md).

Though unmentioned in the bibliography of sources above, the following are acknowledged for their work in pioneering the digitization process of gurbani, translations, and pronunciations:

- Dr. Kulbir S Thind
- SHARE Charity UK

[npm-image]: https://img.shields.io/npm/v/@shabados/database.svg
[npm-url]: https://npmjs.org/package/@shabados/database
[downloads-image]: https://img.shields.io/npm/dm/@shabados/database.svg
[downloads-url]: https://npmcharts.com/compare/@shabados/database?minimal=true
[website-url]: https://shabados.com
[instagram-image]: https://img.shields.io/badge/Instagram-%40shabad__os-C13584.svg?logo=instagram&logoColor=white
[instagram-url]: https://www.instagram.com/shabad_os/
[twitter-image]: https://img.shields.io/badge/Twitter-%40shabad__os-1DA1F2.svg?logo=twitter&logoColor=white
[twitter-url]: https://www.twitter.com/shabad_os/
[chat-image]: https://img.shields.io/badge/Chat-Public%20Slack%20Channels-1264a3.svg?logo=slack
[chat-url]: https://chat.shabados.com
[new-issue-url]: https://github.com/shabados/database/issues/new/choose
[contributor-url]: https://github.com/shabados/database/graphs/contributors
[upvote-tracker-url]: https://github.com/shabados/database/issues?q=is%3Aopen+is%3Aissue+label%3A%22Type%3A+Feature%2FEnhancement%22+sort%3Areactions-%2B1-desc
[contributor-covenant-url]: https://www.contributor-covenant.org/version/2/0/code_of_conduct/
