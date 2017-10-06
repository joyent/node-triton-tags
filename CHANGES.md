# node-triton-tags changelog

## 1.1.5 (not yet released)

- VOLAPI-85: replace smartdc_role=nfsvolumestorage with
  triton.system_role=nfsvolumestorage

## 1.1.4

- DOCKER-1020: Add 'triton.network.public' tag

## 1.1.3

- joyent/node-triton-tags#2: allow DNS names to start with a number. Even
  though this is not recommended by the DNS RFCs, in practice it is used
  fairly commonly (including by a number of major websites)

## 1.1.2

- CNS-153: Upper case in services tags stopped working (another unplanned
  feature)

## 1.1.1

- CNS-152: allowing periods in service names: an unplanned feature

## 1.1.0

- CNS-147: new PEG parser for triton.cns.services tag, so this can be
  shared with triton-cns as well. Now supports ports for SRV records and
  extensible properties.

## 1.0.0

- DOCKER-736 Initial release.
