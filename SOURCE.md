# Source pin

This fork started from the public snapshot `6d79eeb` (2026-04-23).

Official camp repo (private):
https://github.com/Claude-Code-Pro-Camp/leadstack-crm-boilerplate

Official HEAD as of 2026-09-29 tarball:
`b9681c74c92122fbcac022f5412d4b4b688b2eb4`

That commit adds invite-only team seats on a single workspace.
It does not add brochure features (website builder, workflows, AI, sub-accounts).

To fast-forward this fork from the official tarball:

```bash
tar -xzf leadstack-crm-boilerplate.tar.gz
cd leadstack-crm-boilerplate
git remote add mine git@github.com:dwillitzer/leadstack-crm-boilerplate.git
git push mine main
```

No LICENSE file in the official tree. Do not resell.
