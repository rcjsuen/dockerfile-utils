# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]
### Added
- expose ValidationCode enum as an API that may change ([#7](https://github.com/rcjsuen/dockerfile-utils/issues/7))

## [0.0.3] - 2018-01-17
### Added
- create TypeScript typings ([#5](https://github.com/rcjsuen/dockerfile-utils/issues/5))
- add the main field to package.json ([#6](https://github.com/rcjsuen/dockerfile-utils/issues/6))

## [0.0.2] - 2018-01-17
### Fixed
- include final character of the file when printing errors in the linter ([#4](https://github.com/rcjsuen/dockerfile-utils/issues/4))
- change linter to ignore EXPOSE instructions that use ARG variables without a default value ([#3](https://github.com/rcjsuen/dockerfile-utils/issues/3))

## 0.0.1 - 2017-12-22
### Added
- create formatter for Dockerfiles
- create linter for Dockerfiles

[Unreleased]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.2...HEAD
[0.0.3]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.1...v0.0.2
