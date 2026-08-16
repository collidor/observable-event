## [1.0.3](https://github.com/collidor/observable-event/compare/v1.0.2...v1.0.3) (2026-08-16)


### Bug Fixes

* **ci:** add dummy NPM_TOKEN to satisfy semantic-release preflight check for OIDC ([f79215c](https://github.com/collidor/observable-event/commit/f79215c5d53bd83e857da86b8b9eb3477e14e26d))
* **ci:** decouple npm and jsr publish from semantic-release ([6095673](https://github.com/collidor/observable-event/commit/6095673bc59dac859931a93806070f857d801713))
* **ci:** re-enable native semantic-release npm publishing for OIDC ([84b3075](https://github.com/collidor/observable-event/commit/84b307587ff6ae7a6b571dfd719c74c4532440a5))

## [1.0.2](https://github.com/collidor/observable-event/compare/v1.0.1...v1.0.2) (2026-08-15)


### Bug Fixes

* **ci:** add --allow-dirty to jsr publish to ignore uncommitted lockfiles ([18df583](https://github.com/collidor/observable-event/commit/18df58344835501b6412c78fe172ef36e6aa92b8))

## [1.0.1](https://github.com/collidor/observable-event/compare/v1.0.0...v1.0.1) (2026-08-15)


### Bug Fixes

* **ci:** rename workflow file to publish.yml to match npm trusted publisher configuration ([5d4b46b](https://github.com/collidor/observable-event/commit/5d4b46b6524160c49e65dab8050544cc1284ce86))

# 1.0.0 (2026-08-15)


### Bug Fixes

* **build:** add @swc/core devDependency required for tsup es5 build target ([c06f529](https://github.com/collidor/observable-event/commit/c06f5299ddf27ff0c7cf24f5e8a13da5f07f2f07))
* **ci:** configure npmPublish false and provenance publishCmd for tokenless npm OIDC, fix repo URL format ([d466581](https://github.com/collidor/observable-event/commit/d46658158833b21baf4e628f4be507edf6aea769))
* **ci:** update release pipeline to use OIDC trusted publishing without tokens ([6bea76d](https://github.com/collidor/observable-event/commit/6bea76d633fef5cde4fff44dbc780b62b0556360))


### Features

* add automated semantic-release pipeline for npm and jsr ([61f8f94](https://github.com/collidor/observable-event/commit/61f8f94db39ee2c83d08e872f236f806d85a04f2))

# @collidor/observable-event

## 0.0.4

### Patch Changes

- fix imports
- Updated dependencies
  - @collidor/event@4.3.3

## 0.0.3

### Patch Changes

- Updated dependencies
  - @collidor/event@4.3.2
