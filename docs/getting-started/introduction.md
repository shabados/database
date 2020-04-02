<div align="center">

  ![Schema](../schema.png)
</div>
<br/>
<div align="center">

The most accurate, open, digital representation of Sikh Bani and other Panthic texts, their translations, transliterations, discourse, pronunciation, and more with an evolving, reproducible, and publicly logged set of corrections.

[![CircleCI](https://img.shields.io/circleci/project/github/ShabadOS/database.svg?style=flat)](https://circleci.com/gh/ShabadOS/database)
[![Github All Releases](https://img.shields.io/github/downloads/ShabadOS/database/total.svg?style=flat)](https://github.com/ShabadOS/database/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@shabados/database.svg?style=flat)](https://www.npmjs.com/package/@shabados/database)
[![David](https://img.shields.io/david/ShabadOS/database.svg?style=flat)]()
[![license](https://img.shields.io/github/license/ShabadOS/database.svg?style=flat)]()
<br/>
[![Email](https://img.shields.io/badge/Email-team%40shabados.com-blue.svg)](mailto:team@shabados.com) [![WhatsApp](https://img.shields.io/badge/WhatsApp-%2B1--516--619--6059-brightgreen.svg)](https://wa.me/15166196059) [![Slack](https://img.shields.io/badge/Slack-join%20the%20conversation-B649AB.svg)](https://slack.shabados.com)
<br/>
</div>

## Motivation & Aims
> An open-source, collaborative Gurbani database for *all*.

Shabad OS database is a **sustainable**, **collaborative** effort for the Sangat, by the Sangat, to produce the most **accurate** and wholesome Gurbani database for all to use, whether you're building a Gurbani app, or doing Gurbani research and analysis.

Our mission is to allow others to focus on **innovation** and not spend time reinventing the wheel, while employing ethical licensing and open-source development practices. We want **you** to build something great!

## Benefits
You may be curious about the benefits of using our database. This section elaborates on several distinct key features that will convince you to go ahead and give it a go! 

### Fully open-source
Open-source means that the database's contents, history, and modifications are [publicly accessible](https://github.com/shabados/database). Our commitment to open-source allows us to achieve **inclusive collaboration** and focus on building a **sustainable**, **reusable** database that is not controlled or owned by anyone, but can be used by **everyone**. As the work is all public, 

We're also able to apply licensing that **protects** the database from non-public modification, yet effectively still grants the ownership of the database to the public (see [licensing](licensing) for more details).

Most importantly, open-source means work on the database can always be carried forward by the **community**.

### Quality
With **over 6,000 corrections**, we've built upon the work of SikhiToTheMax II, iGurbani, and GurbaniNow databases. We've even consolidated our efforts with the [GurbaniNow Team](https://GurbaniNow.com) as part of our aim to maintain the most accurate Gurbani database. We'd love for others to work with us too.

A modern [schema](getting-started/schema) has been designed to capture data in the most effective way, ideal for developing **apps**, carrying out data **analysis**, and undertaking **research**. We have incorporated notes from the likes of esteemed **scholars** such as Bhai Joginder Singh Talwara (Daarji) and Sant Gurbachan Singh Bhindrawale. There are also **multiple** language options and translation sources (see [content](#content) for more information). 

The database is also **SGPC compliant**, allowing any software developed using this database to be used in Gurdwaras across the world. 

### Contributions
This project welcomes contributors and contributons from invidiuals and organisations of all levels. We've determined to make it as easy as possible to contribute, and are working on ways to further improve this. 

Not a programmer? You can still contribute. Not a Gurmukhi expert? You can still contribute.

Work **with** us and **contribute** via the [GitHub Repo](https://github.com/shabados/database) to discuss issues, add corrections, and contribute to the roadmap of the ultimate Gurbani consolidation project.

### Updates
Frequent updates to the database are published according to semantic versioning via [npm](https://npmjs.com/package/@shabados/database) and [GitHub releases](https://github.com/shabados/database/releases). This means that you can safely update the database without worrying about the schema changing, according to the version. See [semantic versioning](https://semver.org/) for more information.

### APIs
The `@shabados/database` npm JS package also includes an API that can be used to query the database without SQL. Common operations, such as searching by the first letter of each word in a line have been implemented, and can be used straight away (see [usage overview](usage/overview) for more information).

A hosted API is provided by [GurbaniNow](https://github.com/gurbaninow/api), who also run the [GurbaniNow Search](https://GurbaniNow.com).

### Transparency
Our project is for the Sangat, by the Sangat. Thus, we believe in accountability, attribution, and transparency, allowing the Sangat to determine for themselves the validity and integrity of this Gurbani database.

All work carried out is open-source, and can be seen on [GitHub](https://github.com/shabados/database). The history of changes made to the database can be seen, and with this information easily-accessibly and public, the GitHub repository serves as the transparent source of truth. Anyone can verify the validity and integrity of their copy of the database themselves, saying no more to Gurbani databases that are distributed with no attribution or history. 

Anyone is free to join our open [Slack channel](https://slack.shabados.com), where you can chat with us, receive support, and give your feedback.

## Content

The database contains content from a variety of academic and online sources. As a research-quality source of information, the original attribution and sources of the content is provided below.

### Sri Guru Granth Sahib Ji
- [SGPC PDF](https://web.archive.org/web/20171118031846/http://old.sgpc.net/CDN/Siri%20Guru%20Granth%20Sahib%20without%20Index%20%28Uni%29.pdf)

### Sri Dasam Granth
- ਨਿਤਨੇਮ ਤੇ ਹੋਰ ਬਾਣੀਆ, SGPC, May 2017
  - Jaap
  - Akal Ustat
    - Tav Prasad Svaiyay (ਸ੍ਰਾਵਗ ਸੁਧ)
    - Tav Prasad Svaiyay (ਦੀਨਨ ਕੀ)
  - Kabiyobach Benti Choupai
- ਦਸ ਗ੍ਰੰਥੀ, SGPC, March 2006
  - Akal Ustat
  - Bachittar Natak
  - Chandi Charittar Ukat Bilas
  - Chandi Charittar
  - Vaar Sri Bhagauti Ji Ki
  - Gyan Prabodh
  - Shabad Hazare
- [Gobind Sadan PDF](https://web.archive.org/web/20161019133456/http://media.sikher.com:80/files/Dasam_Granth.pdf) (WARNING: This source is not trustworthy and has various mistakes. We are actively looking for an accurate source for the Baanis listed below! Major and obvious mistakes have been corrected.)
  - Chaubees Avtaar
  - Brahma Avtar
  - Rudra Avtar
  - 33 Svaiyay
  - Khalsa Mahima
  - Shastar Naam Mala
  - Charitropakhyan
  - Zafarnama
  - Hikayat

### Vaaran
- ਵਾਰਾਂ ਭਾਈ ਗੁਰਦਾਸ ਜੀ, SGPC, November 2011
  - Vaars 1-40
  - Vaar 41, Pauris 2-28
- ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ, Khalsa Brothers Amritsar, 40th Edition (July 2011)
  - Vaar 41, Pauri 1

### Kabit Swaiye
- ਕਬਿਤ ਸਵਯੇੇ ਭਾਈ ਗੁਰਦਾਸ ਜੀ ਸਟੀਕ, Bhai Seva Singh, Singh Brothers Amritsar, 5th Edition (July 2006)

### Bhai Nand Lal Ji
- ਭਾਈ ਨੰਦ ਲਾਲ ਗ੍ਰੰਥਾਵਲੀ, Dr. Ganda Singh, Punjabi University (Patiala), 4th Edition (2009)
    - Guzals
    - Rubaiyia
    - Zindgi Nama
    - Ganj Nama
    - Jot Bigas (Farsi)
    - Jot Bigas (Punjabi)
    - Tankhah Nama
    - Rehitnama
    - Arzul-Alfaaz
    - Touseefo-Sana

### Sarabloh Granth
- ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ, Khalsa Brothers Amritsar, 24th Edition (September 1992)

### Gurbilas Patshai 10
- ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ, Khalsa Brothers Amritsar, 24th Edition (September 1992)

### Sri Gur Sobha
- ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ, Khalsa Brothers Amritsar, 24th Edition (September 1992)

## Comparisons
The table below outlines some comparisons between the databases, as of 20/10/18.

| Source           | Public | Changes | Maintained | Open-Source | SGPC Compatible |
| ---------------- | :----: | ------- | :--------: | :---------: | :-------------: |
| Shabad OS        | ✅      | -       | ✅          | ✅           | ✅               |
| SikhiToTheMax II | ❌      | 6000    | ❌          | ❌           | ❌               |
| BaniDB           | ❌      | 4892    | ✅          | ❌           | ❌               |
| iGurbani         | ❌      | ?       | ❌          | ❌           | ❌               |
| Sikher           | ✅      | ?       | ❌          | ❓           | ❌               |