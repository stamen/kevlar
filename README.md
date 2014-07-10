# kevlar

Synthetic load generation.

This assumes a source (`SOURCE_URL`) that outputs syslog lines (from Fastly, in
this case) and a target (`TARGET_URL`) to send matching requests to.

## Notes

This is currently intended for use with Toner and Fastly syslog output, but
both can be generalized (the latter by provided a regex with a single capture).
It also makes `HEAD` requests in order to reduce bandwidth utlization (with the
knowledge that in this case the target will perform all necessary work in
response).
