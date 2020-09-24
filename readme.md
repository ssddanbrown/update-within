# update-within

**This is an early alpha-stage module, Please read the "package state" notice below**

This is a command line package to find content set within text boundaries within a "model" file to then use that to update the content sat within matching bounds in other files.

### Usage

```bash
# Syntax
update-within [options] model_file update_file...

# Options (Defaults shown)
--boundary="<!-- UPDATE: {key} -->"

# Examples
update-within index.html page2.html page3.html
```

### Package State

This was quickly made for a specific use-case and therefore:
* Has not been thoroughly tested.
* Has bad documentation.
* Uses `sync` operations instead of `async` operations.
* Has an interface that's likely to change.
* Has not been created with performance in mind.

I'm intending to improve upon this when time permits. 