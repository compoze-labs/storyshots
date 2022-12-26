# Developing Guide

## Path to Production

* Create CI Image + Publish to CI Registry
* Test CI Image against local batect bundle
* Promote CI Image to semantic versioned artifact
* Publish docker image at semantic version
* Update internal batect.yml to point to new semantic version