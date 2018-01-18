# Changelog
All notable changes to this project will be documented in this file.

## [0.0.5] - 2018-01-18
### Added
- warn if COPY's --from flag is invalid ([#9](https://github.com/rcjsuen/dockerfile-utils/issues/9))

### Fixed
- correct import error in the CLI linter ([#8](https://github.com/rcjsuen/dockerfile-utils/issues/8))

## [0.0.4] - 2018-01-17
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

[0.0.5]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/rcjsuen/dockerfile-utils/compare/v0.0.1...v0.0.2
