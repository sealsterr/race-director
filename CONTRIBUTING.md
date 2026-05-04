# Contributing

## Read This First

Contributions are welcome.

RaceDirector is still early, and it is built for a focused use case: a reliable broadcast-control app and overlay system for Le Mans Ultimate streamers and commentators. The best contributions are easy to review, easy to validate during a live-race workflow, and aligned with that direction.

If you want the best chance of getting something accepted, keep it focused and follow the rules.

Pull requests will be automatically labeled with a `vouch:*` trust status and a `size:*` diff size. That helps set review expectations quickly and keeps triage consistent.

If you are a new contributor, expect `vouch:unvouched` at first. Regular contributors can be added to [.github/VOUCHED.td](.github/VOUCHED.td) over time.

## What is most likely to be accepted

Small, focused bug fixes.

Reliability fixes.

Clear improvements to the LMU connection, telemetry bridge, overlays, updater, or installer.

Small performance improvements.

Maintenance work that clearly improves the project without changing its direction.

## What is most likely to be rejected

Large PRs.

Drive-by work.

Opinionated edits.

If you open a 1,000+ line PR full of new features, I will probably ask you to reduce the scope or start with an issue first.

## Opening a PR

Keep it small.

Explain exactly what changed.

Explain exactly why the change should exist.

Do not mix unrelated fixes together.

If the PR makes any UI change, include clear before/after images.

If you change motion, timing, transitions, or interaction details, include a short video.

If I have to guess what changed, the review will be much slower.
