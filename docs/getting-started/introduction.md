# Shabad OS Database
[![CircleCI](https://img.shields.io/circleci/project/github/ShabadOS/database.svg?style=for-the-badge   ':no-zoom')](https://circleci.com/gh/ShabadOS/database)
[![Github All Releases](https://img.shields.io/github/downloads/ShabadOS/database/total.svg?style=for-the-badge  ':no-zoom')](https://github.com/ShabadOS/database/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@shabados/database.svg?style=for-the-badge  ':no-zoom')](https://www.npmjs.com/package/@shabados/database)
[![David](https://img.shields.io/david/ShabadOS/database.svg?style=for-the-badge  ':no-zoom')]()
[![license](https://img.shields.io/github/license/ShabadOS/database.svg?style=for-the-badge  ':no-zoom')]()

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
With **over 6,000 corrections**, we've built upon the work of iGurbani, SikhiToTheMax, and GurbaniNow databases. We've even consolidated our efforts with the [GurbaniNow Team](https://GurbaniNow.com) as part of our aim to maintain the most accurate Gurbani database. We'd love for others to work with us too.

A modern [schema](getting-started/schema) has been designed to capture data in the most effective way, ideal for developing **apps**, carrying out data **analysis**, and undertaking **research**. We have incorporated notes from the likes of esteemed **scholars** such as Bhai Joginder Singh Talwara (Daarji), Sant Gurbachan Singh Bhindrawale. There are also **multiple** language options and translation sources (see [content](#content) for more information). 

The database is also **SGPC compliant**, allowing any software developed using this database to be used in Gurdwaras across the world. 

### Contributions
This project welcomes contributors and contributons from invidiuals and organisations of all levels. We've determined to make it as easy as possible to contribute, and are working on ways to further improve this. 

Not a programmer? You can still contribute. Not a Gurmukhi expert? You can still contribute.

Work **with** us and **contribute** via the [GitHub Repo](https://github.com/shabados/database) to discuss issues, add corrections, and contribute to the roadmap of the ultimate Gurbani consolidation project.

### Updates
Frequent updates to the database are published according to semantic versioning via [npm](https://npmjs.com/package/@shabados/database) and [GitHub releases](https://github.com/shabados/database/releases). This means that you can safely update the database without worrying about the schema changing, according to the version. See [semantic versioning] for more information.

### APIs
The `@shabados/database` npm JS package also includes an API that can be used to query the database without SQL. Common operations, such as searching by the first letter of each word in a line have been implemented, and can be used straight away (see [Models](models) and [API examples](examples) for more information).

A hosted API is provided by [GurbaniNow](https://github.com/gurbaninow/api), who also run the [GurbaniNow Search](https://GurbaniNow.com).

### Transparency
Our project is for the Sangat, by the Sangat. Thus, we believe in accountabiility, attribution, and transparency, allowing the Sangat to determine for themselves the validity and integrity of this Gurbani database.

All work carried out is open-source, and can be seen on [GitHub](https://github.com/shabados/database). The history of changes made to the database can be seen, and with this information easily-accessibly and public, the GitHub repository serves as the transparent source of truth. Anyone can verify the validity and integrity of their copy of the database themselves, saying no more to Gurbani databases that are distributed with no attribution or history. 

Anyone is free to join our open [Slack channel](https://slack.shabados.com), where you can chat with us, receive support, and give your feedback.

## Content

The database contains content from a variety of academic and online sources. As a research-quality source of information, the original attribution and sources of the content is provided below.

### Sri Guru Granth Sahib Ji
- [SGPC PDF](http://old.sgpc.net/CDN/Siri%20Guru%20Granth%20Sahib%20without%20Index%20%28Uni%29.pdf)

### Sri Dasam Granth
- Das Granthi, SGPC, March 2006
    - Jaap
    - Akal Ustat
    - Bachittar Natak
    - Chandi Charittar Ukat Bilas
    - Chandi Charittar
    - Vaar Sri Bhagauti Ji Ki
    - Gyan Prabodh
    - Shabad Hazare

### Vaaran
- Vaaran Bhai Gurdaas, Dr. Gursharan Kaur Jaggi, Punjabi University (Patiala), 2nd Edition (1999)
    - Vaars 1-40
- Amrit Keertan, Khalsa Brothers Amritsar (now Singh Brothers), 24th Edition (September 1992)
    - Vaar 41, Pauri 1
    - Vaar 41, Pauri 2
    - Vaar 41, Pauri 14
    - Vaar 41, Pauri 15
    - Vaar 41, Pauri 16
    - Vaar 41, Pauri 17
    - Vaar 41, Pauri 18
    - Vaar 41, Pauri 19
- Vaaran Bhai Gurdaas Steek, Bhai Vir Singh, Bhai Vir Singh ਸਾਹਿਤ ਸਦਨ, 22nd Edition (July 2012)
    - Vaar 41

### Kabit Swaiye
- [SGPC PDF](http://old.sgpc.net/CDN/Kabit%20by%20Bhai%20Gurdaas,%20Gurmukhi.pdf)

### Bhai Nand Lal Ji
- Bhai Nand Lal Granthavali, Dr. Ganda Singh, Punjabi University (Patiala), 4th Edition (2009)
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
- Amrit Keertan, Khalsa Brothers Amritsar (now Singh Brothers), 24th Edition (September 1992)

### Gurbilas Patshai 10
- Amrit Keertan, Khalsa Brothers Amritsar (now Singh Brothers), 24th Edition (September 1992)

### Sri Gur Sobha
- Amrit Keertan, Khalsa Brothers Amritsar (now Singh Brothers), 24th Edition (September 1992)

## Comparisons
Fake

| Source           | Public | Changes   | Maintained | Open-Source |
|------------------|--------|-----------|------------|-------------|
| SikhiToTheMax II | No     | 6000      | No         | No          |
| SikhiToTheMax 3  | No     | 600000    | Yes        | No          |
| iGurbani         | No     | 6000000   | No         | No          |
| Sikher           | Yes    | 32423     | No         | No          |